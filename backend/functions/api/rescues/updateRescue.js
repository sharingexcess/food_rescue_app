const { db, COLLECTIONS } = require('../../../helpers')
const { isValidRescuePayload } = require('./isValidRescuePayload')

exports.updateRescue = async ({
  id,
  type,
  status,
  handler_id,
  notes,
  timestamp_scheduled,
  timestamp_completed,
  transfer_ids,
}) => {
  const existing_rescue = await db
    .collection(COLLECTIONS.RESCUES)
    .doc(id)
    .get()
    .then(doc => doc.data())

  if (!existing_rescue) {
    throw new Error(`No existing rescue found matching id: ${id}`)
  }

  const is_valid = await isValidRescuePayload(
    {
      id,
      type,
      status,
      handler_id,
      notes,
      timestamp_scheduled,
      timestamp_completed,
      transfer_ids,
    },
    { validate_transfer_ids: true }
  )

  if (is_valid) {
    // =========================================================
    // TODO: add google calendar event deletion + creation logic
    // =========================================================

    const now = new Date().toISOString()

    const rescue = {
      id: existing_rescue.id, // use existing data
      timestamp_created: existing_rescue.timestamp_created, // use existing data
      timestamp_updated: now, // always updated server side
      type,
      status,
      handler_id,
      notes,
      timestamp_scheduled,
      timestamp_completed,
      transfer_ids,
    }

    console.log('Updating rescue:', rescue)

    await db.collection(COLLECTIONS.RESCUES).doc(id).set(rescue)

    return rescue
  } else {
    throw new Error('Invalid payload')
  }
}
