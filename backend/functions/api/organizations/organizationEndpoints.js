const {
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../../helpers')
const { createOrganization } = require('./createOrganization')
const { getOrganization } = require('./getOrganization')
const { listOrganizations } = require('./listOrganizations')
const { updateOrganization } = require('./updateOrganization')

exports.createOrganizationEndpoint = async (request, response, next) => {
  return new Promise(async resolve => {
    try {
      console.log('API ENDPOINT CALLED: createOrganization')

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

      const organization = await createOrganization(payload)
      response.status(200).send(JSON.stringify(organization))

      resolve()
    } catch (e) {
      next(e)
    }
  })
}

exports.updateOrganizationEndpoint = async (request, response, next) => {
  return new Promise(async resolve => {
    try {
      console.log('API ENDPOINT CALLED: updateOrganization')
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

      const organization = await updateOrganization(payload)
      response.status(200).send(JSON.stringify(organization))

      resolve()
    } catch (e) {
      next(e)
    }
  })
}

exports.listOrganizationsEndpoint = async (request, response, next) => {
  try {
    console.log('API ENDPOINT CALLED: listOrganizations')
    console.log('Received Query:', request.query)

    const requestIsAuthenticated = await authenticateRequest(
      request.get('accessToken'),
      user => user.permission
    )

    if (!requestIsAuthenticated) {
      rejectUnauthorizedRequest(response)
      return
    }

    const organizations = await listOrganizations(request.query)

    response.status(200).send(JSON.stringify(organizations))
  } catch (e) {
    next(e)
  }
}

exports.getOrganizationEndpoint = async (request, response, next) => {
  try {
    console.log('API ENDPOINT CALLED: listOrganizations')
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

    const organization = await getOrganization(id)
    response.status(200).send(JSON.stringify(organization))
  } catch (e) {
    next(e)
  }
}
