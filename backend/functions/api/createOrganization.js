const {
  authenticateRequest,
  rejectUnauthorizedRequest,
  db,
} = require('../../helpers')

async function createOrganizationEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log(
        'INVOKING ENDPOINT: createOrganization()\n',
        'params:',
        JSON.parse(request.body)
      )

      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user => user.is_admin
      )
      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }

      const { id } = request.params
      console.log('Received id:', id)

      if (!id) {
        response.status(400).send('No id param received in request URL.')
        return
      }

      const payload = JSON.parse(request.body)
      const formData = payload.formData
      const timestamp_created = new Date(payload.timestamp_created)
      const timestamp_updated = new Date(payload.timestamp_updated)

      console.log('Received payload:', payload)

      if (!payload) {
        response.status(400).send('No payload received in request body.')
        return
      }

      const organization_payload = await createOrganizationPayload(
        id,
        formData,
        timestamp_created,
        timestamp_updated
      )

      console.log('logging created organization:', organization_payload)

      const created_organization = await db
        .collection('organizations')
        .doc(organization_payload.id)
        .set(organization_payload, { merge: true })

      response.status(200).send(JSON.stringify(created_organization))
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

async function createOrganizationPayload(
  id,
  formData,
  timestamp_created,
  timestamp_updated
) {
  const organization_payload = {
    id: id,
    name: formData.name,
    subtype: formData.subtype,
    timestamp_created: timestamp_created,
    timestamp_updated: timestamp_updated,
    type: formData.type,
  }

  return organization_payload
}

exports.createOrganizationEndpoint = createOrganizationEndpoint
