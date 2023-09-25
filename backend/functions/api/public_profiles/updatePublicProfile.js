const { db, COLLECTIONS } = require('../../../helpers')
const { isValidPublicProfilePayload } = require('./isValidPublicProfilePayload')

// We use this for both create AND update

exports.updatePublicProfile = async ({
  id,
  name,
  email,
  pronouns,
  about_me = '',
  icon = null,
  permission = null,
  jacks = [],
}) => {
  // spell it out above so VSCode can suggest the right args on function calls
  // and combine it into "payload" here so we don't forget one line by accident
  // this also ensures we don't add any stray unexpected properties to the DB record
  const payload = { name, email, pronouns, about_me, icon, permission, jacks }

  const is_valid = await isValidPublicProfilePayload(payload)

  if (is_valid) {
    const now = new Date().toISOString()

    const existing_public_profile = await db
      .collection(COLLECTIONS.PUBLIC_PROFILES)
      .doc(id)
      .get()
      .then(doc => doc.data())

    let public_profile = existing_public_profile
      ? existing_public_profile
      : { id, timestamp_created: now }
    public_profile = {
      ...public_profile,
      ...payload,
      timestamp_updated: now, // always updated server side
    }

    console.log('Updating public_profile:', public_profile)

    await db.collection(COLLECTIONS.PUBLIC_PROFILES).doc(id).set(public_profile)

    return public_profile
  } else {
    throw new Error('Invalid payload')
  }
}
