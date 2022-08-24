const {
  db,
  authenticateRequest,
  rejectUnauthorizedRequest,
  generateUniqueId,
  STATUSES,
  fetchDocument,
} = require('../../helpers')
const { getRescue } = require('./rescue')

async function addWholesaleRecipientEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log(
        'INVOKING ENDPOINT: addWholesaleRecipient()\n',
        'params:',
        JSON.parse(request.body)
      )

      const { id } = request.params

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

      await addWholesaleRecipient(id, payload)
      console.log('Returning successfully')

      response.status(200).send()

      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
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
    impact_data_produce: donation.impact_data_produce * percent,
    impact_data_dairy: donation.impact_data_dairy * percent,
    impact_data_bakery: donation.impact_data_bakery * percent,
    impact_data_meat_fish: donation.impact_data_meat_fish * percent,
    impact_data_non_perishable: donation.impact_data_non_perishable * percent,
    impact_data_prepared_frozen: donation.impact_data_prepared_frozen * percent,
    impact_data_mixed: donation.impact_data_mixed * percent,
    impact_data_other: donation.impact_data_other * percent,
    impact_data_total_weight: donation.impact_data_total_weight * percent,
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
    timestamp_scheduled_start: now,
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
    .set({ stop_ids: [...rescue.stop_ids, id] }, { merge: true })

  return
}

exports.addWholesaleRecipientEndpoint = addWholesaleRecipientEndpoint
exports.addWholesaleRecipient = addWholesaleRecipient
