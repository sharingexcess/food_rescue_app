const {
  db,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')

async function updatePrivateProfileEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log('running updatePrivateProfile')

      const { id } = request.params
      console.log('Received id:', id)

      if (!id) {
        response.status(400).send('No id param received in request URL.')
        return
      }

      // we wait until here to authenticate the request so we can see if this is the
      // driver's own route (that data isn't available until after we fetch the rescue)
      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user => user.id === id // only allow users to update their own public profile
      )

      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }

      const payload = { ...JSON.parse(request.body), id }

      console.log('Received payload:', payload)
      await updatePrivateProfile(id, payload)

      response.status(200).send('Update successful.')
      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

async function updatePrivateProfile(id, payload) {
  if (isPayloadValid(payload)) {
    await db
      .collection('private_profiles')
      .doc(id)
      .set({ id, ...payload }, { merge: true })
      .then(ref => console.log(ref))

    console.log('Successfully updated private profile.')
    return
  } else {
    throw new Error('Invalid payload')
  }
}

function isPayloadValid(payload) {
  if (payload.vehicle_make_model?.length < 5) {
    console.log(
      '[vehicle_make_model] field is invalid, rejecting update:',
      payload.vehicle_make_model
    )
    return false
  } else if (payload.license_state?.length < 2) {
    console.log(
      '[license_state] field is invalid, rejecting update.',
      payload.license_state
    )
    return false
  } else if (payload.license_number?.length < 4) {
    console.log(
      '[license_number] field is invalid, rejecting update.',
      payload.license_number
    )
    return false
  } else if (payload.insurance_provider?.length < 2) {
    console.log(
      '[insurance_provider] field is invalid, rejecting update.',
      payload.insurance_provider
    )
    return false
  } else if (payload.insurance_policy_number?.length < 5) {
    console.log(
      '[insurance_policy_number] field is invalid, rejecting update.',
      payload.insurance_policy_number
    )
    return false
  } else return true
}

exports.updatePrivateProfileEndpoint = updatePrivateProfileEndpoint
exports.updatePrivateProfile = updatePrivateProfile
