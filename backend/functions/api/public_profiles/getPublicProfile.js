const { db, COLLECTIONS } = require('../../../helpers')

exports.getPublicProfile = async id => {
  const public_profile = await db
    .collection(COLLECTIONS.PUBLIC_PROFILES)
    .doc(id)
    .get()
    .then(doc => doc.data())

  console.log('returning public_profile:', public_profile)

  return public_profile
}
