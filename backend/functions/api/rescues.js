const {
  db,
  fetchCollection,
  formatDocumentTimestamps,
} = require('../../helpers')

exports.rescues = async (request, response) => {
  return new Promise(async resolve => {
    try {
      console.log('running rescues')

      const { date_range_start, date_range_end } = request.query
      console.log('Received date_range_start query param:', date_range_start)
      console.log('Received date_range_end query param:', date_range_end)

      const organizations = await fetchCollection('organizations')
      const locations = await fetchCollection('locations')
      const users = await fetchCollection('users')

      const rescues = []
      const stops = []

      let rescues_query = db.collection('rescues')
      let stops_query = db.collection('stops')

      // apply date range filters
      if (date_range_start) {
        rescues_query = rescues_query.where(
          'timestamp_scheduled_start',
          '>=',
          new Date(date_range_start)
        )
        stops_query = stops_query.where(
          'timestamp_scheduled_start',
          '>=',
          new Date(date_range_start)
        )
      }

      if (date_range_end) {
        rescues_query = rescues_query.where(
          'timestamp_scheduled_start',
          '<=',
          new Date(date_range_end)
        )
        stops_query = stops_query.where(
          'timestamp_scheduled_start',
          '<=',
          new Date(date_range_end)
        )
      }

      // execute db queries
      await Promise.all([
        rescues_query
          .get()
          .then(snapshot =>
            snapshot.forEach(doc =>
              rescues.push(formatDocumentTimestamps(doc.data()))
            )
          ),
        stops_query
          .get()
          .then(snapshot =>
            snapshot.forEach(doc =>
              stops.push(formatDocumentTimestamps(doc.data()))
            )
          ),
      ])

      if (!rescues) {
        response.status(200).send([])
      }

      // initialize stops array with length of stop_ids
      for (const rescue of rescues) {
        rescue.stops = []
        const rescue_stops = stops.filter(i => i.rescue_id === rescue.id)
        for (const s of rescue.stop_ids) {
          const stop = formatDocumentTimestamps(
            rescue_stops.find(i => i.id === s) || {}
          )
          stop.organization = formatDocumentTimestamps(
            organizations.find(o => o.id === stop.organization_id) || {}
          )
          stop.location = formatDocumentTimestamps(
            locations.find(l => l.id === stop.location_id) || {}
          )
          rescue.stops.push(stop)
        }
        rescue.handler = formatDocumentTimestamps(
          users.find(u => u.id === rescue.handler_id) || {}
        )
      }

      console.log('returning rescues:', rescues)
      response.status(200).send(JSON.stringify(rescues))
      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}
