const { COLLECTIONS, STATUSES, WEIGHT_CATEGORIES } = require('../../../helpers')
const { db } = require('../../../helpers')
const { getRescue } = require('../rescue')
const { getTransfer } = require('./getTransfer')
const { updateTransfer } = require('./updateTransfer')

exports.cancelTransfer = async (id, notes) => {
  const transfer = await getTransfer(id, { shallow: true })

  console.log('Found transfer:', transfer)

  const rescue = await getRescue(transfer.rescue_id, { shallow: true })

  // update the rescue to move the cancelled transfer to the front
  // NOTE: we DO NOT remove it entirely, no transfers should be without a rescue
  const updatedStopIds = [
    transfer.id,
    ...rescue.stop_ids.filter(id => id !== transfer.id),
  ]

  await db
    .collection(COLLECTIONS.RESCUES)
    .doc(rescue.id)
    .set(
      { stop_ids: updatedStopIds, timestamp_updated: new Date() },
      { merge: true }
    )

  const cancelled_transfer = await updateTransfer({
    ...transfer,
    status: STATUSES.CANCELLED,
    notes: notes,
    total_weight: 0,
    // create an empty categorized weight object
    categorized_weight: Object.fromEntries(
      WEIGHT_CATEGORIES.map(key => [key, 0])
    ),
  })

  return cancelled_transfer
}
