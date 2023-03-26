const {
  rejectUnauthorizedRequest,
  authenticateRequest,
} = require('../../../helpers')
const { cancelTransfer } = require('./cancelTransfer')
const { createTransfer } = require('./createTransfer')
const { getTransfer } = require('./getTransfer')
const { listTransfers } = require('./listTransfers')
const { updateTransfer } = require('./updateTransfer')

exports.getTransferEndpoint = async (request, response, next) => {
  return new Promise(async resolve => {
    try {
      console.log('API ENDPOINT CALLED: getTransfer')

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

      const transfer = await getTransfer(id)

      response.status(200).send(JSON.stringify(transfer))

      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      next(e)
    }
  })
}

exports.createTransferEndpoint = async (request, response, next) => {
  return new Promise(async resolve => {
    try {
      console.log('API ENDPOINT CALLED: createTransfer')

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

      const transfer = await createTransfer(payload)

      response.status(200).send(JSON.stringify(transfer))

      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      next(e)
    }
  })
}

exports.updateTransferEndpoint = async (request, response, next) => {
  return new Promise(async resolve => {
    try {
      console.log('API ENDPOINT CALLED: updateTransfer')

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

      const transfer = await updateTransfer(payload)

      response.status(200).send(JSON.stringify(transfer))

      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      next(e)
    }
  })
}

exports.cancelTransferEndpoint = async (request, response, next) => {
  return new Promise(async resolve => {
    try {
      console.log('API ENDPOINT CALLED: cancelTransfer')

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

      const cancelled_transfer = await cancelTransfer(id, payload.notes)

      response.status(200).send(JSON.stringify(cancelled_transfer))

      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      next(e)
    }
  })
}

exports.listTransfersEndpoint = async (request, response, next) => {
  try {
    console.log(
      'API ENDPOINT CALLED: cancelTransfer\n',
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

    const transfers = await listTransfers(request.query)
    response.status(200).send(JSON.stringify(transfers))
  } catch (e) {
    next(e)
  }
}
