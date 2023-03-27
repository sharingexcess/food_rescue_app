const { db, generateUniqueId, COLLECTIONS } = require('../../../helpers')
const { isValidTransferPayload } = require('./isValidTransferPayload')

exports.createTransfer = async ({
  type,
  status,
  rescue_id,
  handler_id,
  organization_id,
  location_id,
  notes,
  timestamp_completed,
  total_weight,
  categorized_weight,
}) => {
  // spell it out above so VSCode can suggest the right args on function calls
  // and combine it into "payload" here so we don't forget one line by accident
  const payload = {
    type,
    status,
    rescue_id,
    handler_id,
    organization_id,
    location_id,
    notes,
    timestamp_completed,
    total_weight,
    categorized_weight,
  }

  const is_valid = await isValidTransferPayload(payload)

  if (is_valid) {
    const id = await generateUniqueId(COLLECTIONS.TRANSFERS)
    console.log('Generated new id for transfer:', id)

    const now = new Date().toISOString()

    const transfer = {
      id, // always created server side
      timestamp_created: now, // always created server side
      timestamp_updated: now, // always created server side
      notes: payload.notes || '', // force to be empty string if null,
      ...payload,
    }

    console.log('Creating transfer:', transfer)

    await db.collection(COLLECTIONS.TRANSFERS).doc(id).set(transfer)

    return transfer
  } else {
    throw new Error('Invalid payload')
  }
}
