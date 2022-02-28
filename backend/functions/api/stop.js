const { db, formatDocumentTimestamps } = require('../../helpers')

exports.stop = async (request, response) => {
  return new Promise(async resolve => {
    try {
      console.log('running stop')

      const { stop_id } = request.params
      console.log('Received id:', stop_id)

      if (!stop_id) {
        response.status(400).send('No stop_id param received in request URL.')
        return
      }

      // load base rescue object from DB
      const stop = await db
        .collection('stops')
        .doc(stop_id)
        .get()
        .then(doc => formatDocumentTimestamps(doc.data()))

      if (!stop) {
        response.status(200).send(null)
      }

      console.log('Got Stop:', stop)

      // populate organization and location for each stop
      const metadata_promises = [
        db
          .collection('organizations')
          .doc(stop.organization_id)
          .get()
          .then(doc => {
            const payload = doc.data()
            stop.organization = formatDocumentTimestamps(payload)
            delete stop.organization_id
          }),
        db
          .collection('locations')
          .doc(stop.location_id)
          .get()
          .then(doc => {
            const payload = doc.data()
            stop.location = formatDocumentTimestamps(payload)
            delete stop.location_id
          }),
      ]
      await Promise.all(metadata_promises)

      console.log('returning stop:', stop)
      response.status(200).send(JSON.stringify(stop))

      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}
