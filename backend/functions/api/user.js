const { performance } = require('perf_hooks')
const {
  db,
  formatDocumentTimestamps,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')

async function userEndpoint(request, response, next) {
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
      user => user.permission == 'admin' || user.id === id
    )

    if (!requestIsAuthenticated) {
      rejectUnauthorizedRequest(response)
      return
    }
    const user = await getUser(id)
    response.status(200).send(JSON.stringify(user))
  } catch (e) {
    next(e)
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
