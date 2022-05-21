const {
  db,
  formatDocumentTimestamps,
  recalculateRescue,
} = require('../../helpers')

async function updateStopEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log('running updateStop')

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

      const updated = await updateStop(id, payload)
      response.status(200).send(JSON.stringify(updated))
      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

async function updateStop(id, payload) {
  // filter to ensure only specific fields can be updated
  // ex. id should be immutable
  const cleaned_payload = removeEmptyValues({
    status: payload.status,
    notes: payload.notes,
    percent_of_total_dropped: payload.percent_of_total_dropped,
    impact_data_dairy: payload.impact_data_dairy,
    impact_data_bakery: payload.impact_data_bakery,
    impact_data_produce: payload.impact_data_produce,
    impact_data_meat_fish: payload.impact_data_meat_fish,
    impact_data_non_perishable: payload.impact_data_non_perishable,
    impact_data_prepared_frozen: payload.impact_data_prepared_frozen,
    impact_data_mixed: payload.impact_data_mixed,
    impact_data_other: payload.impact_data_other,
    impact_data_total_weight: payload.impact_data_total_weight,
    timestamp_logged_start: payload.timestamp_logged_start
      ? new Date(payload.timestamp_logged_start)
      : null,
    timestamp_logged_finish: payload.timestamp_logged_finish
      ? new Date(payload.timestamp_logged_finish)
      : null,
    timestamp_scheduled_start: payload.timestamp_scheduled_start
      ? new Date(payload.timestamp_scheduled_start)
      : null,
    timestamp_scheduled_finish: payload.timestamp_scheduled_finish
      ? new Date(payload.timestamp_scheduled_finish)
      : null,
    timestamp_updated: new Date(),
  })
  if (isPayloadValid(cleaned_payload)) {
    await db
      .collection('stops')
      .doc(id)
      .set(cleaned_payload, { merge: true })
      .then(ref => console.log(ref))

    const stop = await db
      .collection('stops')
      .doc(id)
      .get()
      .then(doc => doc.data())

    await recalculateRescue(stop.rescue_id)
    console.log('Response from update:', stop)
    return stop
  } else {
    throw new Error('Invalid payload')
  }
}

function isPayloadValid(payload) {
  console.log('validating cleaned payload:', payload)
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

exports.updateStopEndpoint = updateStopEndpoint
exports.updateStop = updateStop
