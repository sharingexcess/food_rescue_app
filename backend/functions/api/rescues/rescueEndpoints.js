const {
  rejectUnauthorizedRequest,
  authenticateRequest,
} = require('../../../helpers')
const { cancelRescue } = require('./cancelRescue')
const { createRescue } = require('./createRescue')
const { getRescue } = require('./getRescue')
const { listRescues } = require('./listRescues')
const { updateRescue } = require('./updateRescue')

exports.getRescueEndpoint = async (request, response, next) => {
  return new Promise(async resolve => {
    try {
      console.log('API ENDPOINT CALLED: getRescue')

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

      const rescue = await getRescue(id)

      response.status(200).send(JSON.stringify(rescue))

      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      next(e)
    }
  })
}

exports.createRescueEndpoint = async (request, response, next) => {
  return new Promise(async resolve => {
    try {
      console.log('API ENDPOINT CALLED: createRescue')

      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user => user.permission
      )

      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }

      const payload = JSON.parse(request.body)

      console.log('Received payload:', payload)

      if (!payload) {
        response.status(400).send('No payload received in request body.')
        return
      }

      const rescue = await createRescue(payload)

      response.status(200).send(JSON.stringify(rescue))

      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      next(e)
    }
  })
}

exports.updateRescueEndpoint = async (request, response, next) => {
  return new Promise(async resolve => {
    try {
      console.log('API ENDPOINT CALLED: updateRescue')

      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user => user.permission
      )

      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }

      console.log('BODY:', request.body)

      const payload = JSON.parse(request.body)

      console.log('Received payload:', payload)

      if (!payload) {
        response.status(400).send('No payload received in request body.')
        return
      }

      const rescue = await updateRescue(payload)

      response.status(200).send(JSON.stringify(rescue))

      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      next(e)
    }
  })
}

exports.cancelRescueEndpoint = async (request, response, next) => {
  return new Promise(async resolve => {
    try {
      console.log('API ENDPOINT CALLED: cancelRescue')

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

      const payload = JSON.parse(request.body)

      console.log('Received payload:', payload)

      if (!payload) {
        response.status(400).send('No payload received in request body.')
        return
      }

      const cancelled_rescue = await cancelRescue(id, payload.notes)

      response.status(200).send(JSON.stringify(cancelled_rescue))

      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      next(e)
    }
  })
}

exports.listRescuesEndpoint = async (request, response, next) => {
  try {
    console.log('API ENDPOINT CALLED: listRescues\n', 'params:', request.query)

    const requestIsAuthenticated = await authenticateRequest(
      request.get('accessToken'),
      user => user.permission
    )

    if (!requestIsAuthenticated) {
      rejectUnauthorizedRequest(response)
      return
    }

    const rescues = await listRescues(request.query)
    response.status(200).send(JSON.stringify(rescues))
  } catch (e) {
    next(e)
  }
}
