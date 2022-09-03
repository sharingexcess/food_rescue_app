const {
  db,
  formatDocumentTimestamps,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')

async function stopEndpoint(request, response, next) {
  return new Promise(async resolve => {
    try {
      console.log('running stop')

      const { id } = request.params
      console.log('Received id:', id)

      if (!id) {
        response.status(400).send('No id param received in request URL.')
        return
      }
      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user => user.permission
      )

      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }
      // load base rescue object from DB
      const stop = await getStop(id)
      response.status(200).send(JSON.stringify(stop))
      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      next(e)
    }
  })
}

async function getStop(id) {
  const stop = await db
    .collection('stops')
    .doc(id)
    .get()
    .then(doc => formatDocumentTimestamps(doc.data()))

  if (!stop) return null

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
      }),
    db
      .collection('locations')
      .doc(stop.location_id)
      .get()
      .then(doc => {
        const payload = doc.data()
        stop.location = formatDocumentTimestamps(payload)
      }),
  ]
  await Promise.all(metadata_promises)

  console.log('returning stop:', stop)
  return stop
}

exports.stopEndpoint = stopEndpoint
exports.getStop = getStop
