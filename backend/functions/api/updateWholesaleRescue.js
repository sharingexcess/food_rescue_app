const {
  db,
  authenticateRequest,
  rejectUnauthorizedRequest,
  generateUniqueId,
  STATUSES,
} = require('../../helpers')
const { getRescue } = require('./rescue')
const { getStop } = require('./stop')
const moment = require('moment-timezone')

async function updateWholesaleRescueEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log(
        'INVOKING ENDPOINT: updateWholesaleRescue()\n',
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

      await updateWholesaleRescue(id, payload)
      console.log('returning successfully.')

      response.status(200).send()

      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

async function updateWholesaleRescue(id, payload) {
  const now = new Date()

  const rescue = await getRescue(id)
  const donation = await getStop(rescue.stops[0].id)

  console.log('Rescue:', rescue, 'Donation:', donation)

  const updated_rescue = {
    status: payload.status || rescue.status,
    notes: payload.notes || rescue.notes,
    timestamp_updated: now,
  }

  let updated_donation = {
    organization_id: payload.organization_id || donation.organization_id,
    location_id: payload.location_id || donation.location_id,
    notes: payload.notes || rescue.notes,
    timestamp_updated: now,
    timestamp_logged_finish: now,
  }

  if (payload.date) {
    const timestamp = moment.tz(payload.date, 'America/New_York').toDate()
    updated_rescue.timestamp_scheduled_start = timestamp
    updated_rescue.timestamp_scheduled_finish = timestamp
    updated_rescue.timestamp_logged_start = timestamp
    updated_donation.timestamp_scheduled_start = timestamp
    updated_donation.timestamp_scheduled_finish = timestamp
    updated_donation.timestamp_logged_start = timestamp
  }

  if (payload.status === STATUSES.COMPLETED) {
    updated_rescue.timestamp_logged_finish = now
    updated_donation.timestamp_logged_finish = now
  }

  if (payload.weight) {
    const impact_data = {
      impact_data_produce: 0,
      impact_data_dairy: 0,
      impact_data_bakery: 0,
      impact_data_meat_fish: 0,
      impact_data_non_perishable: 0,
      impact_data_prepared_frozen: 0,
      impact_data_mixed: 0,
      impact_data_other: 0,
      impact_data_total_weight: payload.weight,
    }

    for (const key in impact_data) {
      if (key !== 'impact_data_total_weight' && impact_data[key]) {
        // figure out which food category was used, and updated that weight accordingly
        impact_data[key] = payload.weight
      }
    }
    updated_donation = { ...updated_donation, ...impact_data }
  }

  if (
    payload.weight > donation.impact_data_total_weight &&
    rescue.status === STATUSES.COMPLETED
  ) {
    updated_rescue.status = STATUSES.ACTIVE
  }

  console.log('updating rescue:', updated_rescue)
  await db.collection('rescues').doc(id).set(updated_rescue, { merge: true })
  console.log('updating donation:', updated_donation)
  await db
    .collection('stops')
    .doc(rescue.stop_ids[0])
    .set(updated_donation, { merge: true })

  return
}

exports.updateWholesaleRescueEndpoint = updateWholesaleRescueEndpoint
exports.updateWholesaleRescue = updateWholesaleRescue
