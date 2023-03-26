const {
  ORGANIZATION_TYPES,
  DONOR_SUB_TYPES,
  RECIPIENT_SUB_TYPES,
} = require('../../../helpers')

/*
Example Valid Payload:
{
  name: 'test',
  type: 'donor',
  subtype: 'retail',
}
*/

exports.isValidOrganizationPayload = async ({ name, type, subtype }) => {
  // check that notes are either a string, or falsey.
  if (!name || typeof name !== 'string') {
    console.log(
      `Invalid name, value is: "${name}", type is ${typeof name}. Rejecting.`
    )
    return false
  }

  // check that the type is a valid organization type
  if (Object.values(ORGANIZATION_TYPES).includes(type)) {
    console.log(`Invalid type, value is: "${name}". Rejecting.`)
    return false
  }

  // check that the subtype is valid for donor types
  if (type === ORGANIZATION_TYPES.DONOR && !DONOR_SUB_TYPES.includes(subtype)) {
    console.log(`Invalid subtype, value is: "${name}". Rejecting.`)
    return false
  }

  // check that the subtype is valid for recipient types
  if (
    type === ORGANIZATION_TYPES.RECIPIENT &&
    !RECIPIENT_SUB_TYPES.includes(subtype)
  ) {
    console.log(`Invalid subtype, value is: "${name}". Rejecting.`)
    return false
  }

  return true
}
