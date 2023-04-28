const {
  authenticateRequest,
  rejectUnauthorizedRequest,
  PERMISSION_LEVELS,
} = require('../../../helpers')
const { getPublicProfile } = require('./getPublicProfile')
const { listPublicProfiles } = require('./listPublicProfiles')
const { updatePublicProfile } = require('./updatePublicProfile')

exports.getPublicProfileEndpoint = async (request, response, next) => {
  try {
    console.log('API ENDPOINT CALLED: getPublicProfile')

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

    const public_profile = await getPublicProfile(id)
    response.status(200).send(JSON.stringify(public_profile))
  } catch (e) {
    next(e)
  }
}

exports.listPublicProfilesEndpoint = async (request, response, next) => {
  return new Promise(async resolve => {
    try {
      console.log('API ENDPOINT CALLED: listPublicProfiles')

      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user => user.permission
      )

      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }

      const public_profiles = await listPublicProfiles()
      response.status(200).send(JSON.stringify(public_profiles))

      resolve()
    } catch (e) {
      next(e)
    }
  })
}

exports.updatePublicProfileEndpoint = async (request, response, next) => {
  return new Promise(async resolve => {
    try {
      console.log('API ENDPOINT CALLED: updatePublicProfile')

      const { id } = request.params
      console.log('Received id:', id)

      if (!id) {
        response.status(400).send('No id param received in request URL.')
        return
      }

      const payload = JSON.parse(request.body)
      console.log('Received payload:', payload)

      // Check if this is the first time the profile is being created
      const profile = await getPublicProfile(id)
      console.log('got existing profile:', profile)

      if (!profile || !profile.email) {
        // this is a new profile, continue without authenticating
        // because authenticating requires an existing profile
        const public_profile = await updatePublicProfile({
          ...payload,
          // enforce id from URL is used, and cannot be spoofed in payload
          id,
          // auto-assign standard permission to new accounts
          permission: PERMISSION_LEVELS.STANDARD,
        })
        response.status(200).send(JSON.stringify(public_profile))
        // return early if this was a new profile, else continue into auth sequence
        return
      }

      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user => user.id === id || user.permission === PERMISSION_LEVELS.ADMIN
      )
      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }

      const public_profile = await updatePublicProfile({ ...payload, id })
      response.status(200).send(JSON.stringify(public_profile))

      resolve()
    } catch (e) {
      next(e)
    }
  })
}
