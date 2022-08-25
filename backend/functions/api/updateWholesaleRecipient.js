const {
  db,
  authenticateRequest,
  rejectUnauthorizedRequest,
  generateUniqueId,
  STATUSES,
  fetchDocument,
} = require('../../helpers')
const { getRescue } = require('./rescue')
const { getStop } = require('./stop')

async function updateWholesaleRecipientEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log(
        'INVOKING ENDPOINT: updateWholesaleRecipient()\n',
        'params:',
        JSON.parse(request.body)
      )

      const { id, rescue_id } = request.params

      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user => user.permission == 'admin'
      )

      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }
      const payload = JSON.parse(request.body)

      if (!payload) {
        response.status(400).send('No payload received in request body.')
        return
      }

      await updateWholesaleRecipient(rescue_id, id, payload)
      console.log('Returning successfully')

      response.status(200).send()

      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

async function updateWholesaleRecipient(rescue_id, id, payload) {
  const now = new Date()

  console.log('Getting stop for updateWholesaleRecipient:', rescue_id)
  const stop = await getStop(id)
  console.log('Getting rescue for updateWholesaleRecipient:', rescue_id)
  const rescue = await getRescue(rescue_id)
  const donation = rescue.stops[0]

  console.log('Rescue:', rescue, 'Stop:', stop)

  const percent = payload.percent_of_total_dropped / 100

  const impact_data = {
    impact_data_produce: Math.round(donation.impact_data_produce * percent),
    impact_data_dairy: Math.round(donation.impact_data_dairy * percent),
    impact_data_bakery: Math.round(donation.impact_data_bakery * percent),
    impact_data_meat_fish: Math.round(donation.impact_data_meat_fish * percent),
    impact_data_non_perishable: Math.round(
      donation.impact_data_non_perishable * percent
    ),
    impact_data_prepared_frozen: Math.round(
      donation.impact_data_prepared_frozen * percent
    ),
    impact_data_mixed: Math.round(donation.impact_data_mixed * percent),
    impact_data_other: Math.round(donation.impact_data_other * percent),
    impact_data_total_weight: Math.round(
      donation.impact_data_total_weight * percent
    ),
    percent_of_total_dropped: payload.percent_of_total_dropped,
  }

  const update_payload = {
    organization_id: payload.organization_id,
    location_id: payload.location_id,
    status: STATUSES.COMPLETED,
    notes: payload.notes,
    timestamp_updated: now,
    timestamp_logged_finish: now,
    ...impact_data,
  }

  console.log('Update payload:', update_payload)
  await db.collection('stops').doc(id).set(update_payload, { merge: true })

  if (
    update_payload.percent_of_total_dropped < stop.percent_of_total_dropped &&
    rescue.status === STATUSES.COMPLETED
  ) {
    console.log(
      'Marking rescue as not completed because weight of stop was decreased.'
    )
    await db
      .collection('rescues')
      .doc(rescue_id)
      .set({ status: STATUSES.ACTIVE }, { merge: true })
  }

  return
}

exports.updateWholesaleRecipientEndpoint = updateWholesaleRecipientEndpoint
exports.updateWholesaleRecipient = updateWholesaleRecipient
