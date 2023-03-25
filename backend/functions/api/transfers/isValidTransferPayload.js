const {
  STATUSES,
  isValidIsoDateStringInUTC,
  isValidCategorizedWeightObject,
  isExistingDbRecord,
  COLLECTIONS,
  TRANSFER_TYPES,
} = require('../../../helpers')

/*
Example Valid Payload:
{
  type: 'collection',
  status: 'scheduled',
  rescue_id: 'test',
  handler_id: 'test',
  organization_id: 'test',
  location_id: 'test',
  notes: 'hello world',
  timestamp_completed: new Date().toISOString(),
  total_weight: 8,
  categorized_weight: {
    dairy: 1,
    bakery: 1,
    produce: 1,
    meat_fish: 1,
    non_perishable: 1,
    prepared_frozen: 1,
    mixed: 1,
    other: 1,
  },
}
*/

exports.isValidTransferPayload = async payload => {
  // check that payload has a valid transfer type
  if (!Object.values(TRANSFER_TYPES).includes(payload.type)) {
    console.log(`Detected invalid type, value is: ${payload.type}. Rejecting.`)
    return false
  }

  // check that payload has a valid transfer status
  if (!Object.values(STATUSES).includes(payload.status)) {
    console.log(
      `Detected invalid status, value is: ${payload.status}. Rejecting.`
    )
    return false
  }

  // check that all ids included in payload are valid connections to other db objects
  if (
    !(await isExistingDbRecord(payload.rescue_id, COLLECTIONS.RESCUES)) ||
    !(await isExistingDbRecord(
      payload.organization_id,
      COLLECTIONS.ORGANIZATIONS
    )) ||
    !(await isExistingDbRecord(payload.location_id, COLLECTIONS.LOCATIONS))
  ) {
    return false
  }

  // check handler_id: it can be null, but if it's populated,
  // it needs to match a public profile

  if (
    payload.handler_id &&
    !(await isExistingDbRecord(payload.handler_id, COLLECTIONS.PUBLIC_PROFILES))
  ) {
    console.log(
      `Detected non-null handler_id that does not match a public profile, value is ${payload.handler_id}. Rejecting.`
    )
    return false
  }

  // check that notes are either a string, or falsey.
  if (payload.notes && typeof payload.notes !== 'string') {
    console.log(
      `Invalid notes, value is: "${
        payload.notes
      }", type is ${typeof payload.notes}. Rejecting.`
    )
    return false
  }

  // check that timestamp_completed is valid if status is cancelled or completed
  if (
    [STATUSES.COMPLETED, STATUSES.CANCELLED].includes(payload.status) &&
    !isValidIsoDateStringInUTC(payload.timestamp_completed)
  ) {
    console.log(
      `Invalid timestamp_completed value: ${
        payload.timestamp_completed
      }, type is ${typeof payload.timestamp_completed}. Should be timestamp string in ISO format in UTC, and cannot be null when status is completed or cancelled. Rejecting.`
    )
    return false
  }

  // check that the timestamp_completed is not populated if status is scheduled
  if (payload.status === STATUSES.SCHEDULED && payload.timestamp_completed) {
    console.log(
      `Invalid timestamp_completed value: ${payload.timestamp_completed}, should be null when status === scheduled.`
    )
    return false
  }

  // check that total_weight is a non-negative integer
  if (!Number.isInteger(payload.total_weight) || payload.total_weight < 0) {
    console.log(
      `Invalid total_weight, value is: ${
        payload.total_weight
      }, type is ${typeof payload.total_weight}. Rejecting.`
    )
    return false
  }

  // check that categorized_weight contains all non-negative integers, and sums to total_weight
  if (
    !isValidCategorizedWeightObject(
      payload.categorized_weight,
      payload.total_weight
    )
  ) {
    return false
  }

  return true
}
