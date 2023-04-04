const { STATUSES, EMPTY_CATEGORIZED_WEIGHT } = require('../../../helpers')
const { getRescue } = require('../rescues/getRescue')
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
      categorized_weight: EMPTY_CATEGORIZED_WEIGHT(),
    })
  }

  return updated_rescue
}
