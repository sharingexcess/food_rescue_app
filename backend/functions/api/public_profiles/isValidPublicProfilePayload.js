/*
Example Valid Payload:
{
  name: 'test',
}
*/

const { PERMISSION_LEVELS } = require('../../../helpers')

exports.isValidPublicProfilePayload = async ({ name, permission }) => {
  if (typeof name !== 'string') {
    console.log(
      `Invalid name, value is: "${name}", type is ${typeof name}. Rejecting.`
    )
    return false
  }

  if (permission && !Object.values(PERMISSION_LEVELS).includes(permission)) {
    console.log(
      `Invalid name, value is: "${permission}", type is ${typeof permission}. Rejecting.`
    )
    return false
  }

  return true
}
