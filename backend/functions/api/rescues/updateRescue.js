const {
  db,
  COLLECTIONS,
  // createGoogleCalendarEvent,
  // deleteGoogleCalendarEvent,
  STATUSES,
} = require('../../../helpers')
// const { getPublicProfile } = require('../public_profiles/getPublicProfile')
// const { getLocation } = require('../utilities/location')
const { isValidRescuePayload } = require('./isValidRescuePayload')
// const { getTransfer } = require('../transfers/getTransfer')
// const moment = require('moment')

exports.updateRescue = async ({
  id,
  type,
  status,
  handler_id,
  notes,
  weight,
  timestamp_scheduled,
  timestamp_completed,
  transfer_ids,
}) => {
  const existing_rescue = await db
    .collection(COLLECTIONS.RESCUES)
    .doc(id)
    .get()
    .then(doc => doc.data())

  if (!existing_rescue) {
    throw new Error(`No existing rescue found matching id: ${id}`)
  }

  const allow_notes_update = existing_rescue.notes !== notes // true if notes field is different from the existing one
  const validate_transfer_ids = !(
    status === STATUSES.CANCELLED || allow_notes_update
  )
  const allow_weight_update = existing_rescue.weight !== weight

  const is_valid = await isValidRescuePayload(
    {
      id,
      type,
      status,
      handler_id,
      notes,
      weight,
      timestamp_scheduled,
      timestamp_completed,
      transfer_ids,
    },
    { validate_transfer_ids, allow_notes_update, allow_weight_update } // ignore validating transfer list if cancelling
  )

  if (is_valid) {
    const now = new Date().toISOString()

    const rescue = {
      id: existing_rescue.id, // use existing data
      timestamp_created: existing_rescue.timestamp_created, // use existing data
      timestamp_updated: now, // always updated server side
      type,
      status,
      handler_id,
      notes,
      timestamp_scheduled,
      timestamp_completed,
      transfer_ids,
    }

    // google calendar event creation logic

    // const first_transfer = await getTransfer(transfer_ids[0])
    // const location = await getLocation(first_transfer.location_id)
    // const handler = handler_id ? await getPublicProfile(handler_id) : null

    // const google_calendar_payload = {
    //   summary: `Food Rescue: ${handler ? handler.name : 'Available'} - ${moment(
    //     timestamp_scheduled
    //   ).format('M/DD')}`,
    //   location: `${location.address1}, ${location.city}, ${location.state} ${location.zip}`,
    //   description: `Here's a link to open your rescue in the SE Food Rescue App: https://app.sharingexcess.com/rescues/${id}`,
    //   start: {
    //     dateTime: timestamp_scheduled,
    //   },
    //   end: {
    //     dateTime: moment(timestamp_scheduled)
    //       .add(Math.ceil(transfer_ids.length / 2), 'hours') // average 30min per transfer, round up
    //       .toISOString(),
    //   },
    //   attendees: handler ? [{ email: handler.email }] : null,
    // }

    // // delete any existing event to replace it with a new one
    // try {
    //   await deleteGoogleCalendarEvent(existing_rescue.google_calendar_event_id)
    // } catch (_e) {
    //   // ignore
    // }

    // if (rescue.status !== STATUSES.CANCELLED) {
    //   const google_calendar_event = await createGoogleCalendarEvent(
    //     google_calendar_payload
    //   )

    //   rescue.google_calendar_event_id = google_calendar_event.id
    // } else {
    //   rescue.google_calendar_event_id = null
    // }

    console.log('Updating rescue:', rescue)

    await db.collection(COLLECTIONS.RESCUES).doc(id).set(rescue)

    return rescue
  } else {
    throw new Error('Invalid payload')
  }
}
