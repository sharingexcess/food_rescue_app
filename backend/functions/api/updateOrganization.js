const {
  authenticateRequest,
  rejectUnauthorizedRequest,
  db,
} = require('../../helpers')

async function updateOrganizationEndpoint(request, response) {
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
        user => user.is_admin
      )
      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }
      const payload = { ...JSON.parse(request.body), id }
      console.log('Received payload:', payload)
      await updateOrganization(id, payload)
      response.status(200).send('Update successful.')
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

async function updateOrganization(id, payload) {
  if (isPayloadValid(payload)) {
    const existingOrganization = await db
      .collection('organizations')
      .doc(id)
      .get()
      .then(doc => doc.data())

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
