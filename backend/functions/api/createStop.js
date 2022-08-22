const { db, recalculateRescue } = require('../../helpers')

async function createStopEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log('running createStop')
      const { id } = request.params
      console.log('Received id:', id)

      if (!id) {
        response.status(400).send('No id param received in request URL.')
        return
      }
      const payload = JSON.parse(request.body)
      console.log('Received payload:', payload)
      if (!payload) {
        response.status(400).send('No payload received in request body.')
        return
      }

      await createStop(id, payload)
      response.status(200).send()
      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

async function createStop(id, payload) {
  if (isPayloadValid(payload)) {
    await db.collection('stops').doc(id).set(payload, { merge: true })
  } else {
    throw new Error('Invalid payload')
  }
}

function isPayloadValid(payload) {
  console.log('validating payload:', payload)
  if (payload.status && typeof payload.status !== 'string') return false
  if (payload.notes && typeof payload.notes !== 'string') return false
  if (
    payload.impact_data_dairy &&
    typeof payload.impact_data_dairy !== 'number'
  )
    return false
  if (
    payload.impact_data_bakery &&
    typeof payload.impact_data_bakery !== 'number'
  )
    return false
  if (
    payload.impact_data_produce &&
    typeof payload.impact_data_produce !== 'number'
  )
    return false
  if (
    payload.impact_data_meat_fish &&
    typeof payload.impact_data_meat_fish !== 'number'
  )
    return false
  if (
    payload.impact_data_non_perishable &&
    typeof payload.impact_data_non_perishable !== 'number'
  )
    return false
  if (
    payload.impact_data_prepared_frozen &&
    typeof payload.impact_data_prepared_frozen !== 'number'
  )
    return false
  if (
    payload.impact_data_mixed &&
    typeof payload.impact_data_mixed !== 'number'
  )
    return false
  if (
    payload.impact_data_other &&
    typeof payload.impact_data_other !== 'number'
  )
    return false
  if (
    payload.impact_data_total_weight &&
    typeof payload.impact_data_total_weight !== 'number'
  )
    return false
  if (
    payload.percent_of_total_dropped &&
    typeof payload.percent_of_total_dropped !== 'number'
  )
    return false
  if (!payload.timestamp_updated) return false
  return true
}

function removeEmptyValues(obj) {
  // filters all keys with falsey values from object
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => ![null, undefined].includes(v))
  )
}

exports.createStopEndpoint = createStopEndpoint
exports.createStop = createStop
