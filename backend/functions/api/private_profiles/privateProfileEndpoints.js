const {
  authenticateRequest,
  rejectUnauthorizedRequest,
  getUserIdFromToken,
} = require('../../../helpers')
const { getPrivateProfile } = require('./getPrivateProfile')
const { updatePrivateProfile } = require('./updatePrivateProfile')

exports.getPrivateProfileEndpoint = async (request, response, next) => {
  try {
    console.log('API ENDPOINT CALLED: getPrivateProfile')

    // get the user id from the access token to ensure
    // users cannot update someone else's private profile
    const id = getUserIdFromToken(request.get('accessToken'))

    const requestIsAuthenticated = await authenticateRequest(
      request.get('accessToken'),
      user => user.id === id // only this user can get their private profile
    )

    if (!requestIsAuthenticated) {
      rejectUnauthorizedRequest(response)
      return
    }

    const private_profile = await getPrivateProfile(id)
    response.status(200).send(JSON.stringify(private_profile))
  } catch (e) {
    next(e)
  }
}

exports.updatePrivateProfileEndpoint = async (request, response, next) => {
  return new Promise(async resolve => {
    try {
      console.log('API ENDPOINT CALLED: updatePrivateProfile')

      // get the user id from the access token to ensure
      // users cannot update someone else's private profile
      const id = await getUserIdFromToken(request.get('accessToken'))

      console.log('id is', id)

      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user => user.id === id // only this user can update their private profile
      )
      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }

      const payload = { ...JSON.parse(request.body), id }
      console.log('Received payload:', payload)

      const private_profile = await updatePrivateProfile(payload)
      response.status(200).send(JSON.stringify(private_profile))

      resolve()
    } catch (e) {
      next(e)
    }
  })
}
