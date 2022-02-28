const { db, formatDocumentTimestamps } = require('../../helpers')

exports.rescue = async (request, response) => {
  return new Promise(async resolve => {
    try {
      console.log('running getRescue')

      const { rescue_id } = request.params
      console.log('Received rescue_id:', rescue_id)

      if (!rescue_id) {
        response.status(400).send('No rescue_id param received in request URL.')
        return
      }

      // load base rescue object from DB
      const rescue = await db
        .collection('rescues')
        .doc(rescue_id)
        .get()
        .then(doc => formatDocumentTimestamps(doc.data()))

      if (!rescue) {
        response.status(200).send(null)
      }

      console.log('Got Rescue:', rescue)

      // initialize stops array with length of stop_ids
      rescue.stops = new Array(rescue.stop_ids.length)

      const rescue_promises = [
        // populate stops array with data from stops db collection
        ...rescue.stop_ids.map((stop_id, index) =>
          db
            .collection('stops')
            .doc(stop_id)
            .get()
            .then(doc => {
              const payload = doc.data()
              rescue.stops[index] = formatDocumentTimestamps(payload)
            })
        ),
      ]
      if (rescue.handler_id) {
        // populate rescue with handler data
        rescue_promises.push(
          db
            .collection('users')
            .doc(rescue.handler_id)
            .get()
            .then(doc => {
              const payload = doc.data()
              rescue.handler = formatDocumentTimestamps(payload)
            })
        )
      }
      await Promise.all(rescue_promises)

      // populate organization and location for each stop
      const metadata_promises = [
        // create a db request for each organization_id
        ...rescue.stops.map((stop, index) =>
          db
            .collection('organizations')
            .doc(stop.organization_id)
            .get()
            .then(doc => {
              const payload = doc.data()
              rescue.stops[index].organization =
                formatDocumentTimestamps(payload)
            })
        ),
        // create a db request for each location_id
        ...rescue.stops.map((stop, index) =>
          db
            .collection('locations')
            .doc(stop.location_id)
            .get()
            .then(doc => {
              const payload = doc.data()
              rescue.stops[index].location = formatDocumentTimestamps(payload)
            })
        ),
      ]
      await Promise.all(metadata_promises)

      console.log('returning rescue:', rescue)
      response.status(200).send(JSON.stringify(rescue))
      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}
