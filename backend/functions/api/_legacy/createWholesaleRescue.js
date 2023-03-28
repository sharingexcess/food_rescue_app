const {
  db,
  authenticateRequest,
  rejectUnauthorizedRequest,
  generateUniqueId,
  STATUSES,
} = require('../../helpers')
const moment = require('moment-timezone')

async function createWholesaleRescueEndpoint(request, response, next) {
  return new Promise(async resolve => {
    try {
      console.log(
        'INVOKING ENDPOINT: createWholesaleRescue()\n',
        'params:',
        JSON.parse(request.body)
      )

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

      const rescue = await createWholesaleRescue(payload)
      console.log('Returning complete rescue:', rescue)

      response.status(200).send(JSON.stringify(rescue))

      resolve()
    } catch (e) {
      next(e)
    }
  })
}

async function createWholesaleRescue(payload) {
  const rescue_id = await generateUniqueId('rescues')
  const donation_id = await generateUniqueId('stops')
  const now = moment().toDate()
  const timestamp = moment.tz(payload.date, 'America/New_York').toDate()

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

  impact_data[payload.food_category] = payload.weight

  const rescue = {
    id: rescue_id,
    handler_id: payload.handler_id,
    transfer_ids: [donation_id],
    type: 'wholesale',
    status: STATUSES.ACTIVE,
    notes: payload.notes,
    timestamp_created: now,
    timestamp_updated: now,
    timestamp_scheduled: timestamp,
    timestamp_logged_start: timestamp,
    timestamp_scheduled_finish: timestamp,
    timestamp_logged_finish: null,
  }

  const donation = {
    id: donation_id,
    type: 'pickup',
    rescue_id: rescue_id,
    rescue_type: 'wholesale',
    handler_id: payload.handler_id,
    organization_id: payload.organization_id,
    location_id: payload.location_id,
    status: STATUSES.COMPLETED,
    notes: payload.notes,
    timestamp_created: now,
    timestamp_updated: now,
    timestamp_scheduled: timestamp,
    timestamp_logged_start: timestamp,
    timestamp_scheduled_finish: timestamp,
    timestamp_logged_finish: now,
    ...impact_data,
  }

  console.log('creating rescue:', rescue)
  await db.collection('rescues').doc(rescue_id).set(rescue)

  console.log('creating stop:', donation)
  await db.collection('stops').doc(donation_id).set(donation)

  return { ...rescue, stops: [donation] }
}

exports.createWholesaleRescueEndpoint = createWholesaleRescueEndpoint
exports.createWholesaleRescue = createWholesaleRescue
