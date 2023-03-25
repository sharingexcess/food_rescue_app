const { db, generateUniqueId, COLLECTIONS } = require('../../../helpers')
const { isValidTransferPayload } = require('./isValidTransferPayload')

exports.updateTransfer = async ({
  id,
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
  // this also ensures we don't add any stray unexpected properties to the DB record
  const payload = {
    id,
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

  const existing_transfer = await db
    .collection(COLLECTIONS.TRANSFERS)
    .doc(id)
    .get()
    .then(doc => doc.data())

  if (!existing_transfer) {
    throw new Error(`No existing transfer found matching id: ${payload.id}`)
  }

  const is_valid = await isValidTransferPayload(payload)

  if (is_valid) {
    const now = new Date().toISOString()

    const transfer = {
      id: existing_transfer.id, // use existing data
      timestamp_created: existing_transfer.timestamp_created, // use existing data
      timestamp_updated: now, // updated server side
      notes: payload.notes || '', // force to be empty string if null,
      ...payload,
    }

    console.log('Updating transfer:', transfer)

    await db.collection('transfers').doc(id).set(transfer)

    return transfer
  } else {
    throw new Error('Invalid payload')
  }
}
