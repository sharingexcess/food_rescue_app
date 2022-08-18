const { google } = require('googleapis')
const calendar = google.calendar('v3')
const {
  db,
  formatDocumentTimestamps,
  calculateTotalDistanceFromLocations,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')
const { addCalendarEvent } = require('./addCalendarEvent')

async function createRescueEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log(
        'INVOKING ENDPOINT: createRescue()\n',
        'params:',
        JSON.parse(request.body)
      )

      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user => user.permission == 'admin'
      )

      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }

      const { id } = request.params
      console.log('Received id:', id)

      if (!id) {
        response.status(400).send('No id param received in request URL.')
        return
      }
      const payload = JSON.parse(request.body)

      console.log(
        '\n\n\nTIMESTAMPS:\n\n\n',
        'start_payload: ',
        payload.timestamp_scheduled_start
      )

      const formData = payload.formData
      const status_scheduled = payload.status_scheduled
      const timestamp_created = new Date(payload.timestamp_created)
      const timestamp_scheduled_start = new Date(
        payload.timestamp_scheduled_start
      )
      const timestamp_scheduled_finish = new Date(
        payload.timestamp_scheduled_finish
      )
      const timestamp_updated = new Date(payload.timestamp_updated)
      const timestamp_logged_start = payload.timestamp_logged_start
        ? new Date(payload.timestamp_logged_start)
        : null

      console.log(
        '\n\n\nTIMESTAMPS:\n\n\n',
        '\nstart_parsed: ',
        timestamp_scheduled_start,
        '\n\n\n\n'
      )

      console.log('Received payload:', payload)
      if (!payload) {
        response.status(400).send('No payload received in request body.')
        return
      }
      const stops_promises = []
      console.log('All the stops', formData.stops)

      for (const stop of formData.stops) {
        const stop_payload = await createStopsPayload(
          id,
          stop,
          formData,
          status_scheduled,
          timestamp_created,
          timestamp_scheduled_start,
          timestamp_scheduled_finish,
          timestamp_updated
        )

        stops_promises.push(
          db
            .collection('stops')
            .doc(stop_payload.id)
            .set(stop_payload, { merge: true })
        )
      }
      await Promise.all(stops_promises)

      const rescue_payload = await createRescuePayload(
        id,
        formData,
        status_scheduled,
        timestamp_created,
        timestamp_scheduled_start,
        timestamp_scheduled_finish,
        timestamp_updated,
        timestamp_logged_start
      )

      console.log('Logging Created Rescue:', rescue_payload)
      const created_rescue = await db
        .collection('rescues')
        .doc(rescue_payload.id)
        .set(rescue_payload, { merge: true })
      // .then(doc => formatDocumentTimestamps(doc))

      response.status(200).send(JSON.stringify(created_rescue))
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

async function createRescuePayload(
  id,
  formData,
  status_scheduled,
  timestamp_created,
  timestamp_scheduled_start,
  timestamp_scheduled_finish,
  timestamp_updated,
  timestamp_logged_start
) {
  const resource = await createEventResource(
    formData,
    timestamp_scheduled_start,
    timestamp_scheduled_finish
  )
  const event = await addCalendarEvent(resource).catch(err => {
    console.error('Error adding event: ' + err.message)
    response.status(500).send('There was an error with Google calendar')
    return
  })

  if (!event.id) {
    alert('Error creating Google Calendar event. Please contact support!')
    return
  }

  const total_distance = await calculateTotalDistanceFromLocations(
    formData.stops.map(
      stop =>
        `${stop.location.address1} ${stop.location.city} ${stop.location.state} ${stop.location.zip}`
    )
  )

  console.log('Total distance:', total_distance)

  const rescue_payload = {
    id: id,
    handler_id: formData.handler_id,
    google_calendar_event_id: event.id,
    stop_ids: formData.stops.map(s => s.id),
    is_direct_link: formData.is_direct_link,
    status: status_scheduled,
    notes: '',
    timestamp_created: timestamp_created,
    timestamp_updated: timestamp_updated,
    timestamp_scheduled_start: timestamp_scheduled_start,
    timestamp_scheduled_finish: timestamp_scheduled_finish,
    timestamp_logged_start: timestamp_logged_start || null,
    timestamp_logged_finish: null,
    driving_distance: total_distance,
  }

  return rescue_payload
}

async function createStopsPayload(
  id,
  stop,
  formData,
  status_scheduled,
  timestamp_created,
  timestamp_scheduled_start,
  timestamp_scheduled_finish,
  timestamp_updated
) {
  const stop_payload = {
    id: stop.id,
    type: stop.type,
    handler_id: formData.handler_id || null,
    rescue_id: id,
    organization_id: stop.organization_id,
    location_id: stop.location_id,
    status: stop.status || status_scheduled,
    timestamp_created: stop.timestamp_created
      ? new Date(stop.timestamp_created)
      : timestamp_created,
    timestamp_updated: timestamp_updated,
    timestamp_logged_start:
      stop.timestamp_logged_start != null
        ? new Date(stop.timestamp_logged_start)
        : null,
    timestamp_logged_finish:
      stop.timestamp_logged_finish != null
        ? new Date(stop.timestamp_logged_finish)
        : null,
    timestamp_scheduled_start: timestamp_scheduled_start,
    timestamp_scheduled_finish: timestamp_scheduled_finish,
    impact_data_dairy: stop.impact_data_dairy || 0,
    impact_data_bakery: stop.impact_data_bakery || 0,
    impact_data_produce: stop.impact_data_produce || 0,
    impact_data_meat_fish: stop.impact_data_meat_fish || 0,
    impact_data_non_perishable: stop.impact_data_non_perishable || 0,
    impact_data_prepared_frozen: stop.impact_data_prepared_frozen || 0,
    impact_data_mixed: stop.impact_data_mixed || 0,
    impact_data_other: stop.impact_data_other || 0,
    impact_data_total_weight: stop.impact_data_total_weight || 0,
  }
  if (stop.type === 'delivery') {
    stop_payload.percent_of_total_dropped = stop.percent_of_total_dropped || 100
  }

  console.log('Stop Payload:', stop_payload)

  return stop_payload
}

async function createEventResource(
  resource,
  timestamp_scheduled_start,
  timestamp_scheduled_finish
) {
  // console.log('resource handler id', resource.handler_id)
  let handler
  if (resource.handler_id) {
    const handler_ref = await db
      .collection('users')
      .doc(resource.handler_id)
      .get()
      .then(doc => {
        if (doc.exists) {
          handler = doc.data()
        } else {
          console.error('No such document!')
        }
      })
    console.log('[handler]:', handler)
  } else {
    handler = null
  }

  const event = {
    summary: handler
      ? `Food Rescue: ${handler.name}`
      : 'Unassigned Food Rescue',
    location: `${resource.stops[0].location.address1}, ${resource.stops[0].location.city}, ${resource.stops[0].location.state} ${resource.stops[0].location.zip}`,
    description: `Stops on Route: ${resource.stops
      .map(
        s =>
          `${s.organization.name} (${
            s.location.nickname || s.location.address1
          })`
      )
      .join(', ')}`,
    start: {
      dateTime: new Date(timestamp_scheduled_start).toISOString(),
      timeZone: 'America/New_York',
    },
    end: {
      dateTime: new Date(timestamp_scheduled_finish).toISOString(),
      timeZone: 'America/New_York',
    },
    attendees: [handler ? { email: handler.email } : ''],
  }

  console.log('Event:', event)

  return event
}

exports.createRescueEndpoint = createRescueEndpoint
exports.createEventResource = createEventResource
