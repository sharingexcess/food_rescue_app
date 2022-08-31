const {
  db,
  recalculateRescue,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')
const { addCalendarEvent } = require('./addCalendarEvent')
const { deleteEvent } = require('./deleteCalendarEvent')
const { createEventResource } = require('./createRescue')
const { getRescue } = require('./rescue')

async function updateRescueEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log('running updateRescue')

      const { id } = request.params
      console.log('Received id:', id)

      if (!id) {
        response.status(400).send('No id param received in request URL.')
        return
      }

      const payload = JSON.parse(request.body)

      console.log('Received payload:', payload)
      if (!payload) {
        response.status(400).send('No payload received in request body.')
        return
      }

      const rescue = await getRescue(id)
      console.log('[rescue]:', rescue)

      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user =>
          user.permission === 'admin' ||
          (rescue.handler_id && user.id === rescue.handler_id)
      )

      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }

      if (payloadRequiresNewCalendarEvent(payload)) {
        if (rescue.google_calendar_event_id) {
          deleteEvent(rescue.google_calendar_event_id)
        }

        const resource = await createEventResource(
          { ...rescue, ...payload },
          rescue.timestamp_scheduled_start,
          rescue.timestamp_scheduled_finish
        )
        console.log('[resource]:', resource)

        const event = await addCalendarEvent(resource).catch(err => {
          console.error('Error adding event: ' + err.message)
          response.status(500).send('There was an error with Google calendar')
          return
        })
        console.log('[EVENT]:', event)
        payload.google_calendar_event_id = event.id
      }

      const updated = await updateRescue(id, payload)
      const recalculated = await recalculateRescue(id)

      response.status(200).send(JSON.stringify(recalculated))
      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

async function updateRescue(id, payload) {
  // filter to ensure only specific fields can be updated
  // ex. id should be immutable
  const cleaned_payload = removeEmptyValues({
    handler_id: payload.handler_id,
    google_calendar_id: payload.google_calendar_id,
    stop_ids: payload.stop_ids,
    is_direct_link: payload.is_direct_link,
    status: payload.status,
    notes: payload.notes,
    timestamp_logged_start: payload.timestamp_logged_start
      ? new Date(payload.timestamp_logged_start)
      : null,
    timestamp_logged_finish: payload.timestamp_logged_finish
      ? new Date(payload.timestamp_logged_finish)
      : null,
    timestamp_scheduled_start: payload.timestamp_scheduled_start
      ? new Date(payload.timestamp_scheduled_start)
      : null,
    timestamp_scheduled_finish: payload.timestamp_scheduled_finish
      ? new Date(payload.timestamp_scheduled_finish)
      : null,
    timestamp_updated: payload.timestamp_updated
      ? new Date(payload.timestamp_updated)
      : null,
  })
  if (isPayloadValid(cleaned_payload)) {
    const response = await db
      .collection('rescues')
      .doc(id)
      .set(cleaned_payload, { merge: true })
    console.log('Response from update:', response)
    return response
  } else {
    throw new Error('Invalid payload')
  }
}

function isPayloadValid(payload) {
  console.log('validating cleaned payload:', payload)
  if (payload.handler_id && typeof payload.handler_id !== 'string') return false
  if (
    payload.google_calendar_id &&
    typeof payload.google_calendar_id !== 'string'
  )
    return false
  if (payload.stop_ids && payload.stop_ids.length < 2) return false
  if (payload.status && typeof payload.status !== 'string') return false
  if (payload.notes && typeof payload.notes !== 'string') return false
  if (!payload.timestamp_updated) return false
  return true
}

function removeEmptyValues(obj) {
  // filters all keys with falsey values from object
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null))
}

function payloadRequiresNewCalendarEvent(payload) {
  return (
    payload.timestamp_scheduled_start ||
    payload.timestamp_scheduled_finish ||
    payload.handler_id ||
    payload.stop_ids
  )
}

exports.updateRescueEndpoint = updateRescueEndpoint
exports.updateRescue = updateRescue
