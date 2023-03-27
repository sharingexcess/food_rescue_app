const { db, STATUSES, FOOD_CATEGORIES } = require('../../../helpers')
const { getRescue } = require('../rescue')
const { listTransfers } = require('../transfers/listTransfers')
const { updateRescue } = require('./updateRescue')
const { updateTransfer } = require('../transfers/updateTransfer')

exports.cancelRescue = async (id, notes) => {
  const now = new Date().toISOString()
  const rescue = await getRescue(id, { shallow: true })

  const updated_rescue = {
    ...rescue,
    status: STATUSES.CANCELLED,
    notes: notes,
    total_weight: 0,
    timestamp_completed: now,
    timestamp_updated: now,
  }

  await updateRescue(updated_rescue)

  const transfers = await listTransfers({ rescue_id: id }, { shallow: true })

  for (const transfer of transfers) {
    await updateTransfer({
      ...transfer,
      status: STATUSES.CANCELLED,
      notes: notes,
      total_weight: 0,
      timestamp_completed: now,
      timestamp_updated: now,
      // create an empty categorized weight object
      categorized_weight: Object.fromEntries(
        FOOD_CATEGORIES.map(key => [key, 0])
      ),
    })
  }

  return updated_rescue
}
