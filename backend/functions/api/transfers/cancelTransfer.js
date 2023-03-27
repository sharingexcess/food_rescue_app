const { COLLECTIONS, STATUSES, FOOD_CATEGORIES } = require('../../../helpers')
const { db } = require('../../../helpers')
const { getRescue } = require('../rescue')
const { getTransfer } = require('./getTransfer')
const { updateTransfer } = require('./updateTransfer')

exports.cancelTransfer = async (id, notes) => {
  const transfer = await getTransfer(id, { shallow: true })

  console.log('Found transfer:', transfer)

  const now = new Date().toISOString()

  const cancelled_transfer = await updateTransfer({
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

  return cancelled_transfer
}
