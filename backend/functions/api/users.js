const { performance } = require('perf_hooks')
const {
  db,
  formatDocumentTimestamps,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')

async function usersEndpoint(request, response) {
  try {
    console.log('INVOKING ENDPOINT: users()\n', 'params:', request.query)

    const requestIsAuthenticated = await authenticateRequest(
      request.get('accessToken'),
      user => user.is_admin
    )

    if (!requestIsAuthenticated) {
      rejectUnauthorizedRequest(response)
      return
    }
    const users = await getUsers()
    response.status(200).send(JSON.stringify(users))
  } catch (e) {
    console.error('Caught error:', e)
    response.status(500).send(e.toString())
  }
}

async function getUsers() {
  const start = performance.now()
  const users = []

  await db
    .collection('users')
    .get()
    .then(snapshot => {
      snapshot.forEach(doc =>
        users.push({ ...formatDocumentTimestamps(doc.data()) })
      )
    })

  console.log(
    'finished users query:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  console.log(
    'returning users:',
    users.map(i => i.id)
  )

  console.log(
    'getUsers execution time:',
    (performance.now() - start) / 1000,
    'seconds'
  )
  return users
}

exports.usersEndpoint = usersEndpoint
exports.getUsers = getUsers
