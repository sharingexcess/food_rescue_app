const { performance } = require('perf_hooks')
const {
  authenticateRequest,
  rejectUnauthorizedRequest,
  db,
} = require('../../helpers')

async function updateUserPermissionEndpoint(response, request) {
  return new Promise(async resolve => {
    try {
      console.log('running changeUserPermission')
      console.log(request)
      const { id } = request.params
      console.log('Received id:', id)

      if (!id) {
        response.status(400).send('No id param received in request URL.')
        return
      }

      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user => user.permission == 'admin'
      )

      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }

      const payload = { ...JSON.parse(request.body), id }
      console.log('Received Payload:', payload)

      response.status(200).send('User permission updated.')
      resolve()

      await updatePermission(id, payload)
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

async function updatePermission(id, payload) {
  const updatedUserPermission = payload.permission
  if (isValidUserPermission(updatedUserPermission)) {
    console.log('Valid Permission')
    await db
      .collection('public_profiles')
      .doc(id)
      .set({ id, ...payload }, { merge: true })
      .then(ref => console.log(ref))
  } else {
    throw new Error('Invalid user permission')
  }
}

function isValidUserPermission(updatedUserPermission) {
  return (
    updatedUserPermission == NULL ||
    updatedUserPermission == 'standard' ||
    updatedUserPermission == 'admin'
  )
}

exports.updateUserPermissionEndpoint = updateUserPermissionEndpoint
