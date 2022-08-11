const { performance } = require('perf_hooks')
const {
  authenticateRequest,
  db,
  formatDocumentTimestamps,
  rejectUnauthorizedRequest,
} = require('../../helpers')

async function organizationsEndpoint(request, response) {
  try {
    console.log(
      'INVOKING ENDPOINT: organizations()\n',
      'params:',
      request.query
    )
    const requestIsAuthenticated = await authenticateRequest(
      request.get('accessToken'),
      user => user.is_admin
    )

    // if (!requestIsAuthenticated) {
    //   rejectUnauthorizedRequest(response)
    //   return
    // }
    const organizations = await getOrganizations()
    response.status(200).send(JSON.stringify(organizations))
  } catch (e) {
    console.error('Caught error:', e)
    response.status(500).send(e.toString())
  }
}

async function getOrganizations() {
  const start = performance.now()
  const organizations = []

  await db
    .collection('organizations')
    .get()
    .then(snapshot => {
      snapshot.forEach(doc =>
        organizations.push({ ...formatDocumentTimestamps(doc.data()) })
      )
    })

  console.log(
    'finished organizations query:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  console.log(
    'returning organizations:',
    organizations.map(i => i.id)
  )

  console.log(
    'getOrganizations execution time:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  return organizations
}

exports.organizationsEndpoint = organizationsEndpoint
exports.getOrganizations = getOrganizations
