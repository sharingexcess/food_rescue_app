const { performance } = require('perf_hooks')
const {
  authenticateRequest,
  rejectUnauthorizedRequest,
  db,
  formatDocumentTimestamps,
} = require('../../helpers')

async function publicProfilesEndpoint(request, response) {
  try {
    console.log(
      'INVOKING ENDPOINT: publicProfiles()\n',
      'params:',
      request.query
    )

    const requestIsAuthenticated = await authenticateRequest(
      request.get('accessToken'),
      user => user.permission
    )

    if (!requestIsAuthenticated) {
      rejectUnauthorizedRequest(response)
      return
    }
    const publicProfiles = await getPublicProfiles()
    response.status(200).send(JSON.stringify(publicProfiles))
  } catch (e) {
    console.error('Caught error:', e)
    response.status(500).send(e.toString())
  }
}

async function getPublicProfiles() {
  const start = performance.now()
  const publicProfiles = []

  await db
    .collection('public_profiles')
    .orderBy('name', 'asc')
    .get()
    .then(snapshot => {
      snapshot.forEach(doc =>
        publicProfiles.push({ ...formatDocumentTimestamps(doc.data()) })
      )
    })

  console.log(
    'finished public profiles query:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  console.log(
    'returning public profiles:',
    publicProfiles.map(i => i.id)
  )

  console.log(
    'getPublicProfiles execution time:',
    (performance.now() - start) / 1000,
    'seconds'
  )
  return publicProfiles
}

exports.publicProfilesEndpoint = publicProfilesEndpoint
exports.getPublicProfiles = getPublicProfiles
