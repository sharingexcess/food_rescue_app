const { performance } = require('perf_hooks')
const {
  db,
  formatDocumentTimestamps,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')

async function userEndpoint(request, response) {
  try {
    console.log('INVOKING ENDPOINT: user()\n', 'params:', request.params)

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
    const user = await getUser(id)
    response.status(200).send(JSON.stringify(user))
  } catch (e) {
    console.error('Caught error:', e)
    response.status(500).send(e.toString())
  }
}

async function getUser(id) {
  const start = performance.now()

  const user = await db
    .collection('users')
    .doc(id)
    .get()
    .then(doc => formatDocumentTimestamps(doc.data()))
  console.log(id, user)

  console.log(
    'finished user query:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  console.log('returning user:', user)

  console.log(
    'getUser execution time:',
    (performance.now() - start) / 1000,
    'seconds'
  )
  return user
}

exports.userEndpoint = userEndpoint
exports.getUser = getUser
