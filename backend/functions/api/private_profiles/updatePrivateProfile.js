const { db, COLLECTIONS, generateUniqueId } = require('../../../helpers')
const {
  isValidPrivateProfilePayload,
} = require('./isValidPrivateProfilePayload')

// We use this for both create AND update

exports.updatePrivateProfile = async ({
  id,
  email,
  phone,
  vehicle_make_model,
  insurance_policy_number,
  insurance_provider,
  license_number,
  license_state,
  completed_liability_release,
}) => {
  // spell it out above so VSCode can suggest the right args on function calls
  // and combine it into "payload" here so we don't forget one line by accident
  // this also ensures we don't add any stray unexpected properties to the DB record
  const payload = {
    email,
    phone,
    vehicle_make_model,
    insurance_policy_number,
    insurance_provider,
    license_number,
    license_state,
    completed_liability_release,
  }

  const is_valid = await isValidPrivateProfilePayload(payload)

  if (is_valid) {
    const now = new Date().toISOString()

    const existing_private_profile = await db
      .collection(COLLECTIONS.PRIVATE_PROFILES)
      .doc(id)
      .get()
      .then(doc => doc.data())

    let private_profile = existing_private_profile
      ? existing_private_profile
      : { id, timestamp_created: now }

    private_profile = {
      ...private_profile,
      ...payload,
      timestamp_updated: now, // always updated server side
    }

    console.log('Updating private_profile:', private_profile)

    await db
      .collection(COLLECTIONS.PRIVATE_PROFILES)
      .doc(id)
      .set(private_profile)

    return private_profile
  } else {
    throw new Error('Invalid payload')
  }
}
