const {
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../../helpers')
const { createLocation } = require('./createLocation')
const { updateLocation } = require('./updateLocation')

exports.createLocationEndpoint = async (request, response, next) => {
  return new Promise(async resolve => {
    try {
      console.log('API ENDPOINT CALLED: createLocation')

      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user => user.permission === 'admin'
      )
      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }

      const payload = JSON.parse(request.body)
      console.log('Received payload:', payload)

      const location = await createLocation(payload)
      response.status(200).send(JSON.stringify(location))

      resolve()
    } catch (e) {
      next(e)
    }
  })
}

exports.updateLocationEndpoint = async (request, response, next) => {
  return new Promise(async resolve => {
    try {
      console.log('API ENDPOINT CALLED: updateLocation')
      const { id } = request.params
      console.log('Received id:', id)
      if (!id) {
        response.status(400).send('No id param received in request URL.')
        return
      }

      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user => user.permission === 'admin'
      )
      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }

      const payload = { id, ...JSON.parse(request.body) }
      console.log('Received payload:', payload)

      const location = await updateLocation(payload)
      response.status(200).send(JSON.stringify(location))

      resolve()
    } catch (e) {
      next(e)
    }
  })
}
