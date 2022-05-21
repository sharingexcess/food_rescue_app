const {
  db,
  formatDocumentTimestamps,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')
const { performance } = require('perf_hooks')

async function rescueEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log('INVOKING ENDPOINT: rescue()\n', 'params:', {
        ...request.params,
        ...request.query,
      })

      const { id } = request.params

      if (!id) {
        response.status(400).send('No id param received in request URL.')
        return
      }

      // load base rescue object from DB
      const rescue = await getRescue(id)

      if (!rescue) {
        response.status(200).send(null)
      }

      // we wait until here to authenticate the request so we can see if this is the
      // driver's own route (that data isn't available until after we fetch the rescue)
      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user => user.is_admin || (rescue && user.id === rescue.handler_id)
      )

      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }

      response.status(200).send(JSON.stringify(rescue))
      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(e.toString())
    }
  })
}

async function getRescue(id) {
  const start = performance.now()
  // load base rescue object from DB
  const rescue = await db
    .collection('rescues')
    .doc(id)
    .get()
    .then(doc => formatDocumentTimestamps(doc.data()))

  if (!rescue) return null

  console.log('Got Rescue:', rescue)

  // populate the full information for all stops on the rescue
  const stops = []
  await db
    .collection('stops')
    .where('rescue_id', '==', rescue.id)
    .get()
    .then(snapshot =>
      snapshot.forEach(doc => stops.push(formatDocumentTimestamps(doc.data())))
    )

  // we have to do this map/find operation to ensure that the order of stops is correct
  rescue.stops = rescue.stop_ids.map(id => stops.find(stop => stop.id === id))

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
          rescue.stops[index].organization = formatDocumentTimestamps(payload)
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

  if (rescue.handler_id) {
    // populate rescue with handler data
    metadata_promises.push(
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

  await Promise.all(metadata_promises)

  console.log('returning rescue:', rescue)

  console.log(
    'getRescue execution time:',
    (performance.now() - start) / 1000,
    'seconds'
  )
  return rescue
}

exports.rescueEndpoint = rescueEndpoint
exports.getRescues = getRescue
