const {
  db,
  formatDocumentTimestamps,
  calculateTotalDistanceFromLocations,
} = require('../../helpers')

async function createRescueEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log('running createRescue')

      const { id } = request.params
      console.log('Received id:', id)

      if (!id) {
        response.status(400).send('No id param received in request URL.')
        return
      }
      const payload = JSON.parse(request.body)

      const event = payload.event
      const formData = payload.formData
      const status_scheduled = payload.status_scheduled
      const timestamp_created = new Date(payload.timestamp_created)
      const timestamp_scheduled_start = new Date(
        payload.timestamp_scheduled_start
      )
      const timestamp_scheduled_finish = new Date(
        payload.timestamp_scheduled_finish
      )

      console.log('Received payload:', payload)
      if (!payload) {
        response.status(400).send('No payload received in request body.')
        return
      }
      const stops_promises = []
      console.log('All the stops', formData.stops)

      for (const stop of formData.stops) {
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
          timestamp_updated: timestamp_created,
          timestamp_logged_start: stop.timestamp_logged_start
            ? new Date(stop.timestamp_logged_start)
            : null,
          timestamp_logged_finish: stop.timestamp_logged_finish
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
          stop_payload.percent_of_total_dropped =
            stop.percent_of_total_dropped || 100
        }
        formatDocumentTimestamps(stop_payload)

        console.log('Logging Stop', stop_payload)
        stops_promises.push(
          db
            .collection('stops')
            .doc(stop_payload.id)
            .set(stop_payload, { merge: true })
        )
      }
      await Promise.all(stops_promises)

      const rescue_payload = {
        id: id,
        handler_id: formData.handler_id,
        google_calendar_event_id: event.id,
        stop_ids: formData.stops.map(s => s.id),
        is_direct_link: formData.is_direct_link,
        status: status_scheduled,
        notes: '',
        timestamp_created: timestamp_created,
        timestamp_updated: timestamp_created,
        timestamp_scheduled_start: timestamp_scheduled_start,
        timestamp_scheduled_finish: timestamp_scheduled_finish,
        timestamp_logged_start: null, //rescue ? new Date(rescue.timestamp_logged_start) : null,
        timestamp_logged_finish: null, // rescue ? new Date(rescue.timestamp_logged_finish)  : null,
      }

      // const total_distance = await calculateTotalDistanceFromLocations(
      //   formData.stops.map(
      //     stop =>
      //       `${stop.location.address1} ${stop.location.city} ${stop.location.state} ${stop.location.zip}`
      //   )
      // )

      // console.log('total distance:', total_distance)

      console.log('Logging Created Rescue:', rescue_payload)
      const created_rescue = await db
        .collection('rescues')
        .doc(rescue_payload.id)
        .set(rescue_payload, { merge: true })
        .then(doc => formatDocumentTimestamps(doc)) //Attempt to fix how timestamps are saved

      response.status(200).send(JSON.stringify(created_rescue))
      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

exports.createRescueEndpoint = createRescueEndpoint
