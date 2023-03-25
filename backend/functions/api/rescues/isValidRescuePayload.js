const {
  STATUSES,
  isValidIsoDateStringInUTC,
  isExistingDbRecord,
  COLLECTIONS,
  RESCUE_TYPES,
  isValidTransferIdList,
} = require('../../../helpers')

/*
Example Valid Payload:
{
  type: 'retail',
  status: 'scheduled',
  handler_id: 'test',
  notes: 'test',
  timestamp_scheduled: new Date().toISOString(),
  timestamp_completed: null,
  transfer_ids: ['test_collection', 'test_distribution']
}
*/

exports.isValidRescuePayload = async (
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
  options = { validate_transfer_ids: true }
) => {
  // check that payload has a valid transfer type
  if (!Object.values(RESCUE_TYPES).includes(type)) {
    console.log(`Detected invalid type, value is: ${type}. Rejecting.`)
    return false
  }

  // check that payload has a valid rescue status
  if (!Object.values(STATUSES).includes(status)) {
    console.log(`Detected invalid status, value is: ${status}. Rejecting.`)
    return false
  }

  // check handler_id: it can be null, but if it's populated,
  // it needs to match a public profile
  if (
    handler_id &&
    !(await isExistingDbRecord(handler_id, COLLECTIONS.PUBLIC_PROFILES))
  ) {
    console.log(
      `Detected non-null handler_id that does not match a public profile, value is ${handler_id}. Rejecting.`
    )
    return false
  }

  // check that notes are either a string, or falsey.
  if (notes && typeof notes !== 'string') {
    console.log(
      `Invalid notes, value is: "${notes}", type is ${typeof notes}. Rejecting.`
    )
    return false
  }

  // check that the timestamp_scheduled is an ISO string in UTC
  if (!isValidIsoDateStringInUTC(timestamp_scheduled)) {
    console.log(
      `Invalid timestamp_scheduled: ${timestamp_scheduled}, type is ${typeof timestamp_scheduled}. Should be timestamp string in ISO format in UTC. Rejecting.`
    )
    return false
  }

  // check that timestamp_completed is valid if status is cancelled or completed
  if (
    [STATUSES.COMPLETED, STATUSES.CANCELLED].includes(status) &&
    !isValidIsoDateStringInUTC(timestamp_completed)
  ) {
    console.log(
      `Invalid timestamp_completed value: ${timestamp_completed}, type is ${typeof timestamp_completed}. Should be timestamp string in ISO format in UTC, and cannot be null when status is completed or cancelled. Rejecting.`
    )
    return false
  }

  // check that the timestamp_completed is not populated if status is scheduled
  if (status === STATUSES.SCHEDULED && timestamp_completed) {
    console.log(
      `Invalid timestamp_completed value: ${timestamp_completed}, should be null when status === scheduled.`
    )
    return false
  }

  if (options.validate_transfer_ids) {
    if (!(await isValidTransferIdList(transfer_ids, id))) {
      return false
    }
  }

  return true
}
