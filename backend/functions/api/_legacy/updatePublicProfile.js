const {
  db,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')

async function updatePublicProfileEndpoint(request, response, next) {
  return new Promise(async resolve => {
    try {
      console.log('running updatePublicProfile')

      const { id } = request.params
      console.log('Received id:', id)

      if (!id) {
        response.status(400).send('No id param received in request URL.')
        return
      }

      const existingProfile = await db
        .collection('public_profiles')
        .doc(id)
        .get()
        .then(doc => doc.data())
        .catch(error => {
          throw new Error('Error while fetching from Firestore:', error)
        })

      if (existingProfile) {
        // only authenticate this request for a previously created profile
        // allow all users to create a new profile
        const requestIsAuthenticated = await authenticateRequest(
          request.get('accessToken'),
          user => user.id === id || user.permission == 'admin' // only allow users to update their own public profile
        )

        if (!requestIsAuthenticated) {
          rejectUnauthorizedRequest(response)
          return
        }
      }

      const payload = { ...JSON.parse(request.body), id }

      console.log('Received payload:', payload)
      await updatePublicProfile(id, payload)

      response.status(200).send('Update successful.')
      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      next(e)
    }
  })
}

async function updatePublicProfile(id, payload) {
  if (isPayloadValid(payload)) {
    const existingPublicProfile = await db
      .collection('public_profiles')
      .doc(id)
      .get()
      .then(doc => doc.data())

    if (!existingPublicProfile) {
      // grant standard permission to new users
      payload.permission = 'standard'
    }

    await db
      .collection('public_profiles')
      .doc(id)
      .set({ id, ...payload }, { merge: true })
      .then(ref => console.log(ref))

    console.log('Successfully updated public profile.')
    return
  } else {
    throw new Error('Invalid payload')
  }
}

function isPayloadValid(payload) {
  if (!payload.name) {
    console.log('[name] field is invalid, rejecting update:', payload.name)
    return false
  } else if (!payload.pronouns) {
    console.log(
      '[pronouns] field is invalid, rejecting update.',
      payload.pronouns
    )
    return false
  } else if (payload.email?.length < 6 || !payload.email?.includes('@')) {
    console.log('[email] field is invalid, rejecting update.', payload.email)
    return false
  } else return true
}

exports.updatePublicProfileEndpoint = updatePublicProfileEndpoint
exports.updatePublicProfile = updatePublicProfile
