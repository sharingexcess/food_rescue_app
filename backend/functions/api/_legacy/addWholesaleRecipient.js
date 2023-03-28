const {
  db,
  authenticateRequest,
  rejectUnauthorizedRequest,
  generateUniqueId,
  STATUSES,
  fetchDocument,
} = require('../../helpers')
const { getRescue } = require('./rescue')

async function addWholesaleRecipientEndpoint(request, response, next) {
  return new Promise(async resolve => {
    try {
      console.log(
        'INVOKING ENDPOINT: addWholesaleRecipient()\n',
        'params:',
        JSON.parse(request.body)
      )

      const { rescue_id } = request.params

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

      await addWholesaleRecipient(rescue_id, payload)
      console.log('Returning successfully')

      response.status(200).send()

      resolve()
    } catch (e) {
      next(e)
    }
  })
}

async function addWholesaleRecipient(rescue_id, payload) {
  const id = await generateUniqueId('stops')
  const now = new Date()

  console.log('Getting rescue for addWholesaleRecipient:', rescue_id)
  const rescue = await getRescue(rescue_id)
  const donation = rescue.stops[0]

  console.log('Rescue:', rescue, 'Donation:', donation)

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

  const stop = {
    id,
    type: 'delivery',
    rescue_id: rescue_id,
    rescue_type: 'wholesale',
    handler_id: rescue.handler_id,
    organization_id: payload.organization_id,
    location_id: payload.location_id,
    status: STATUSES.COMPLETED,
    notes: payload.notes,
    timestamp_created: now,
    timestamp_updated: now,
    timestamp_scheduled: now,
    timestamp_logged_start: now,
    timestamp_scheduled_finish: now,
    timestamp_logged_finish: now,
    ...impact_data,
  }

  console.log('Generated new stop:', stop)
  await db.collection('stops').doc(id).set(stop)

  console.log('Adding stop to rescue')
  await db
    .collection('rescues')
    .doc(rescue_id)
    .set({ transfer_ids: [...rescue.transfer_ids, id] }, { merge: true })

  return
}

exports.addWholesaleRecipientEndpoint = addWholesaleRecipientEndpoint
exports.addWholesaleRecipient = addWholesaleRecipient
