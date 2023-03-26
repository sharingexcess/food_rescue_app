const {
  ORGANIZATION_TYPES,
  DONOR_SUB_TYPES,
  RECIPIENT_SUB_TYPES,
} = require('../../../helpers')

/*
Example Valid Payload:
{
  email: 'test',
  phone: 'test',
  vehicle_make_model: 'test',
  insurance_policy_number: 'test',
  insurance_provider: 'test',
  license_number: 'test',
  license_state: 'test',
  completed_liability_release: true,
}
*/

exports.isValidPrivateProfilePayload = async ({
  email,
  phone,
  vehicle_make_model,
  insurance_policy_number,
  insurance_provider,
  license_number,
  license_state,
  completed_liability_release,
}) => {
  // check that all parts of driver_info are strings
  const driver_info = {
    email,
    phone,
    vehicle_make_model,
    insurance_policy_number,
    insurance_provider,
    license_number,
    license_state,
  }

  for (const property in driver_info) {
    if (!driver_info[property] || typeof driver_info[property] !== 'string') {
      console.log(
        `Invalid ${property}, value is: "${
          driver_info[property]
        }", type is ${typeof driver_info[property]}. Rejecting.`
      )
    }
  }

  if (completed_liability_release !== true) {
    console.log('completed_liability_release must be true. Rejecting.')
  }

  return true
}
