const { performance } = require('perf_hooks')
const {
  authenticateRequest,
  rejectUnauthorizedRequest,
  db,
  formatDocumentTimestamps,
  fetchDocument,
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
      user => user.permission
    )

    if (!requestIsAuthenticated) {
      rejectUnauthorizedRequest(response)
      return
    }

    const publicProfile = await getPublicProfile(id)
    response.status(200).send(JSON.stringify(publicProfile))
  } catch (e) {
    console.error('Caught error:', e)
    response.status(500).send(e.toString())
  }
}

async function getPublicProfile(id) {
  const start = performance.now()

  const publicProfileRef = await db
    .collection('public_profiles')
    .doc(id)
    .get()
    .then(doc => formatDocumentTimestamps(doc.data()))

  console.log(id, publicProfileRef)

  console.log(
    'finished publicProfile query:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  const privateProfile = await db
    .collection('private_profiles')
    .doc(id)
    .get()
    .then(doc => doc.data())
  console.log(privateProfile)

  const publicProfile = {
    ...publicProfileRef,
    has_completed_private_profile: await hasCompletedPrivateProfile(
      privateProfile
    ),
  }

  console.log('returning publicProfile:', publicProfile)

  console.log(
    'getPublicProfile execution time:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  return publicProfile
}

function hasCompletedPrivateProfile(profile) {
  return (
    profile &&
    profile.phone &&
    profile.vehicle_make_model &&
    profile.license_number &&
    profile.license_state &&
    profile.insurance_provider &&
    profile.insurance_policy_number &&
    profile.completed_liability_release
  )
}

exports.publicProfileEndpoint = publicProfileEndpoint
exports.getPublicProfile = getPublicProfile
