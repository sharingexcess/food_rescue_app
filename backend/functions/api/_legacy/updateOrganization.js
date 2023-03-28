const {
  authenticateRequest,
  rejectUnauthorizedRequest,
  db,
} = require('../../helpers')

async function updateOrganizationEndpoint(request, response, next) {
  return new Promise(async resolve => {
    try {
      console.log('running updateOrganization')
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
      const payload = { ...JSON.parse(request.body), id }
      console.log('Received payload:', payload)
      await updateOrganization(id, payload)
      response.status(200).send(JSON.stringify('Update successful.'))
      resolve()
    } catch (e) {
      next(e)
    }
  })
}

async function updateOrganization(id, payload) {
  if (isPayloadValid(payload)) {
    await db
      .collection('organizations')
      .doc(id)
      .set({ id, ...payload }, { merge: true })
      .then(ref => console.log(ref))
    console.log('Successfully updated organization')
    return
  } else {
    throw new Error('Invalid payload')
  }
}

function isPayloadValid(payload) {
  if (!payload.name) {
    console.log('[name] field is invalid, rejecting update:', payload.name)
    return false
  } else if (!payload.subtype) {
    console.log(
      '[subtype] field is invalid, rejecting update:',
      payload.subtype
    )
    return false
  } else if (!payload.type) {
    console.log('[type] field is invalid, rejecting update:', payload.type)
    return false
  } else return true
}

exports.updateOrganizationEndpoint = updateOrganizationEndpoint
exports.updateOrganization = updateOrganization
