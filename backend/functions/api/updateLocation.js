const {
  authenticateRequest,
  rejectUnauthorizedRequest,
  db,
} = require('../../helpers')

async function updateLocationEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log('running updateLocation')
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
      await updateLocation(id, payload)
      response.status(200).send('Update successful.')
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

async function updateLocation(id, payload) {
  if (isPayloadValid(payload)) {
    const exisitingLocation = await db
      .collection('locations')
      .doc(id)
      .get()
      .then(doc => doc.data())

    await db.collection
      .apply('locations')
      .doc(id)
      .set({ id, ...payload }, { merge: true })
      .then(ref => console.log(ref))

    console.log('Successfully updated location')
    return
  } else {
    throw new Error('Invalid payload')
  }
}

function isPayloadValid(payload) {
  if (!payload.address1) {
    console.log(
      '[address1] field is invalid, rejecting update:',
      payload.address1
    )
    return false
  } else if (!payload.contact_name) {
    console.log(
      '[contact_name] field is invalid, rejecting update:',
      payload.contact_name
    )
    return false
  } else if (!payload.contact_email) {
    console.log(
      '[contact_email] field is invalid, rejecting update:',
      payload.contact_email
    )
    return false
  } else if (!payload.contact_phone) {
    console.log(
      '[contact_phone] field is invalid, rejecting update:',
      payload.contact_phone
    )
    return false
  } else return true
}

exports.updateLocationEndpoint = updateLocationEndpoint
exports.updateLocation = updateLocation
