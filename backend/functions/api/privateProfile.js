const { performance } = require('perf_hooks')
const {
  authenticateRequest,
  rejectUnauthorizedRequest,
  db,
  formatDocumentTimestamps,
} = require('../../helpers')

async function privateProfileEndpoint(request, response, next) {
  try {
    console.log(
      'INVOKING ENDPOINT: privateProfile()\n',
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
      user => user.permission == 'admin' || user.id === id
    )

    if (!requestIsAuthenticated) {
      rejectUnauthorizedRequest(response)
      return
    }

    const privateProfile = await getPrivateProfile(id)
    response.status(200).send(JSON.stringify(privateProfile))
  } catch (e) {
    next(e)
  }
}

async function getPrivateProfile(id) {
  const start = performance.now()

  const privateProfile = await db
    .collection('private_profiles')
    .doc(id)
    .get()
    .then(doc => formatDocumentTimestamps(doc.data()))

  console.log(id, privateProfile)

  console.log(
    'finished privateProfile query:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  console.log('returning privateProfile:', privateProfile)

  console.log(
    'getPrivateProfile execution time:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  return privateProfile
}

exports.privateProfileEndpoint = privateProfileEndpoint
exports.getPrivateProfile = getPrivateProfile
