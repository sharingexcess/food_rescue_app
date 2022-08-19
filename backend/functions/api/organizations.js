const { performance } = require('perf_hooks')
const {
  db,
  formatDocumentTimestamps,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')

async function organizationsEndpoint(request, response) {
  try {
    console.log(
      'INVOKING ENDPOINT: organizations()\n',
      'params:',
      request.query
    )

    const { type, subtype } = request.query

    const requestIsAuthenticated = await authenticateRequest(
      request.get('accessToken'),
      user => user.permission == 'admin'
    )

    if (!requestIsAuthenticated) {
      rejectUnauthorizedRequest(response)
      return
    }
    const organizations = await getOrganizations(type, subtype)
    response.status(200).send(JSON.stringify(organizations))
  } catch (e) {
    console.error('Caught error:', e)
    response.status(500).send(e.toString())
  }
}

async function getOrganizations(type, subtype) {
  const start = performance.now()
  const organizations = []
  const locations = []

  let query = db.collection('organizations')

  if (type) {
    query = query.where('type', '==', type)
  }

  if (type && subtype) {
    query = query.where('subtype', '==', subtype)
  }

  await Promise.all([
    query.get().then(snapshot => {
      snapshot.forEach(doc =>
        organizations.push({
          ...formatDocumentTimestamps(doc.data()),
          locations: [],
        })
      )
    }),
    db
      .collection('locations')
      .get()
      .then(snapshot => {
        snapshot.forEach(doc =>
          locations.push({ ...formatDocumentTimestamps(doc.data()) })
        )
      }),
  ])

  for (const location of locations) {
    const org = organizations.find(i => i.id === location.organization_id)
    if (org) {
      org.locations.push(location)
    }
  }

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
