const {
  db,
  generateUniqueId,
  COLLECTIONS,
  TRANSFER_TYPES,
  RESCUE_TYPES,
  createGoogleCalendarEvent,
} = require('../../../helpers')
const { isValidRescuePayload } = require('./isValidRescuePayload')
const {
  isValidTransferPayload,
} = require('../transfers/isValidTransferPayload')
const { getLocation } = require('../utilities/location')
const { getPublicProfile } = require('../public_profiles/getPublicProfile')
const {
  callWithExponentialBackoff,
} = require('../api_helpers/callWithExponentialBackoff')
const moment = require('moment')

exports.createRescue = async ({
  type,
  status,
  handler_id,
  notes,
  timestamp_scheduled,
  timestamp_completed,
  transfers,
}) => {
  const rescue_id = await generateUniqueId(COLLECTIONS.RESCUES)
  const now = new Date().toISOString()

  // complete transfers with ids, rescue_id, and timestamps
  transfers = await Promise.all(
    transfers.map(async transfer => ({
      id: await generateUniqueId(COLLECTIONS.TRANSFERS), // always created server side
      rescue_id, // always created server side
      timestamp_created: now, // always created server side
      timestamp_updated: now, // always created server side,
      notes: '',
      ...transfer,
    }))
  )

  // complete rescue with rescue_id, transfer_ids, and timestamps
  const rescue = {
    id: rescue_id, // always created server side
    transfer_ids: transfers.map(transfer => transfer.id), // always created server side
    timestamp_created: now, // always created server side
    timestamp_updated: now, // always created server side
    notes: notes || '', // force to be empty string if null,
    type,
    status,
    handler_id,
    timestamp_scheduled,
    timestamp_completed,
  }

  // google calendar event creation logic

  const location = await getLocation(transfers[0].location_id)
  const handler = await getPublicProfile(rescue.handler_id)

  const google_calendar_payload = {
    summary: `Food Rescue: ${handler.name} - ${moment(
      rescue.timestamp_scheduled
    ).format('M/DD')}`,
    location: `${location.address1}, ${location.city}, ${location.state} ${location.zip}`,
    description: `Here's a link to open your rescue in the SE Food Rescue App: https://app.sharingexcess.com/rescues/${rescue.id}`,
    start: {
      dateTime: rescue.timestamp_scheduled,
    },
    end: {
      dateTime: moment(rescue.timestamp_scheduled)
        .add(Math.ceil(transfers.length / 2), 'hours') // average 30min per transfer, round up
        .toISOString(),
    },
    attendees: [{ email: handler.email }],
  }

  try {
    const google_calendar_event = await callWithExponentialBackoff(
      createGoogleCalendarEvent,
      [google_calendar_payload]
    )
    rescue.google_calendar_event_id = google_calendar_event.id
  } catch (e) {
    console.log('Error creating google calendar event:', e)
  }

  // validate the rescue record itself, but not yet the transfer_ids list
  // because the records are not yet in the db
  let is_valid = await isValidRescuePayload(rescue, {
    validate_transfer_ids: false,
  })

  // then validate each of the included transfers
  for (const transfer of transfers) {
    if (
      !(await isValidTransferPayload(transfer, {
        bypass_rescue_id_validation: true,
      }))
    ) {
      is_valid = false
      break
    }
  }

  // EXTRA CHECK: because the transfers aren't yet created in the db,
  // we need to validate that we start with a collection and end with
  // a distribution in memory here. Does not apply to wholesale rescues,
  // as they're initialized without any distributions.
  if (
    transfers[0].type !== TRANSFER_TYPES.COLLECTION ||
    (rescue.type !== RESCUE_TYPES.WHOLESALE &&
      transfers[transfers.length - 1].type !== TRANSFER_TYPES.DISTRIBUTION)
  ) {
    console.log(
      'Rescue must begin with a collection and end with a distribution. Transfer list is invalid. Rejecting.'
    )
    is_valid = false
  }

  if (is_valid) {
    // begin db write with validated data
    // batch all db writes to ensure atomic failure
    const batch = db.batch()

    console.log('Creating rescue:', rescue)
    batch.set(db.collection(COLLECTIONS.RESCUES).doc(rescue.id), rescue)

    for (const transfer of transfers) {
      console.log('Creating transfer:', transfer)
      batch.set(db.collection(COLLECTIONS.TRANSFERS).doc(transfer.id), transfer)
    }

    console.log('Commiting batch of db writes...')
    await batch.commit()

    console.log(
      `Successfully created new rescue (${rescue.id}) and transfer (${rescue.transfer_ids}) records.`
    )

    return { ...rescue, transfers }
  } else {
    throw new Error('Invalid payload')
  }
}
