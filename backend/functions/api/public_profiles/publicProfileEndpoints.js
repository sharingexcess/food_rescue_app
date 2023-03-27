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
