const moment = require('moment')
const { performance } = require('perf_hooks')
const {
  db,
  formatDocumentTimestamps,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')

async function organizationEndpoint(request, response) {
  try {
    console.log(
      'INVOKING ENDPOINT: organization()\n',
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
      organization =>
        organization.permission == 'admin' || organization.id === id
    )

    if (!requestIsAuthenticated) {
      rejectUnauthorizedRequest(response)
      return
    }
    const organization = await getOrganization(id)
    response.status(200).send(JSON.stringify(organization))
  } catch (e) {
    console.error('Caught error:', e)
    response.status(500).send(e.toString())
  }
}

async function getOrganization(id) {
  const start = performance.now()

  const organization = await db
    .collection('organizations')
    .doc(id)
    .get()
    .then(doc => formatDocumentTimestamps(doc.data()))
  console.log(id, organization)

  console.log(
    'finished organization query:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  organization.locations = []
  await db
    .collection('locations')
    .where('organization_id', '==', id)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc =>
        organization.locations.push({
          ...formatDocumentTimestamps(doc.data()),
          stops: [],
        })
      )
    })

  console.log('returning organization:', organization)

  console.log(
    'getOrganization execution time:',
    (performance.now() - start) / 1000,
    'seconds'
  )
  return organization
}

exports.organizationEndpoint = organizationEndpoint
exports.getOrganization = getOrganization
