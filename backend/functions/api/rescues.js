const moment = require('moment')
const {
  db,
  fetchCollection,
  formatDocumentTimestamps,
} = require('../../helpers')

exports.rescues = async (request, response) => {
  return new Promise(async resolve => {
    try {
      console.log('running rescues')

      console.log('Received params:', request.query)
      const { date, status, handler_id, limit, start_after } = request.query

      const organizations = await fetchCollection('organizations')
      const locations = await fetchCollection('locations')
      const users = await fetchCollection('users')

      const rescues = []
      const stops = []

      let rescues_query = db.collection('rescues')
      let stops_query = db.collection('stops')

      let start_after_ref
      if (start_after) {
        await db
          .collection('rescues')
          .doc(start_after)
          .get()
          .then(doc => {
            start_after_ref = doc
          })
      }

      // apply filters

      if (date) {
        const start = new Date(date)
        const end = moment(start).add(24, 'hours').toDate()
        console.log(start, end)
        rescues_query = rescues_query
          .where('timestamp_scheduled_start', '>=', start)
          .where('timestamp_scheduled_start', '<=', end)
        stops_query = stops_query
          .where('timestamp_scheduled_start', '>=', start)
          .where('timestamp_scheduled_start', '<=', end)
      }

      if (handler_id) {
        rescues_query = rescues_query.where('handler_id', '==', handler_id)
      }

      if (status) {
        rescues_query = rescues_query.where('status', '==', status)
      }

      if (limit) {
        rescues_query = rescues_query.limit(parseInt(limit))
      }

      if (start_after) {
        rescues_query = rescues_query
          .orderBy('timestamp_scheduled_start')
          .startAfter(start_after_ref)
      } else {
        rescues_query = rescues_query.orderBy(
          'timestamp_scheduled_start',
          'desc'
        )
      }

      // execute db queries
      await Promise.all([
        rescues_query.get().then(snapshot => {
          snapshot.forEach(doc =>
            rescues.push(formatDocumentTimestamps(doc.data()))
          )
        }),
        stops_query
          .get()
          .then(snapshot =>
            snapshot.forEach(doc =>
              stops.push(formatDocumentTimestamps(doc.data()))
            )
          ),
      ])

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
          console.log('Found completed stop:', stop)
          rescue.stops.push(stop)
        }
        rescue.handler = formatDocumentTimestamps(
          users.find(u => u.id === rescue.handler_id) || {}
        )
      }

      console.log(
        'returning rescues:',
        rescues
        // .map(i => i.id)
      )
      response.status(200).send(JSON.stringify(rescues))
      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}
