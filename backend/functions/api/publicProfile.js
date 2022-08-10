const { performance } = require('perf_hooks')
const {
  authenticateRequest,
  rejectUnauthorizedRequest,
  db,
  formatDocumentTimestamps,
} = require('../../helpers')

async function publicProfileEndpoint(request, response) {
  try {
    console.log(
      'INVOKING ENDPOINT: publicProfile()\n',
      'params:',
      request.params
    )

    const { id } = request.params
    console.log('Received id:', id)
    if (!id) {
      response.status(400).send('No id param received in request URL.')
      return
    }
    const requestIsAuthenticated = await authenticateRequest(
      request.get('accessToken'),
      user => user.is_admin || user.id === id
    )

    if (!requestIsAuthenticated) {
      rejectUnauthorizedRequest(response)
      return
    }

    const user = await getPublicProfile(id)
    response.status(200).send(JSON.stringify(user))
  } catch (e) {
    console.error('Caught error:', e)
    response.staus(500).send(e.toString())
  }
}

async function getPublicProfile(id) {
  const start = performance.now()

  const publicProfile = await db
    .collection('public_profiles')
    .doc(id)
    .get()
    .then(doc => formatDocumentTimestamps(doc.data()))

  console.log(id, publicProfile)

  console.log(
    'finished publicProfile query:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  console.log('returning publicProfile:', publicProfile)

  console.log(
    'getPublicProfile execution time:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  return publicProfile
}

exports.publicProfileEndpoint = publicProfileEndpoint
exports.getPublicProfile = getPublicProfile
