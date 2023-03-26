const { db, COLLECTIONS } = require('../../../helpers')

exports.getPrivateProfile = async id => {
  const private_profile = await db
    .collection(COLLECTIONS.PRIVATE_PROFILES)
    .doc(id)
    .get()
    .then(doc => doc.data())

  console.log('returning private_profile:', private_profile)

  return private_profile
}
