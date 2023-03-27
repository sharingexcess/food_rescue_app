const { db } = require('../../../helpers')

exports.listPublicProfiles = async () => {
  const publicProfiles = []

  await db
    .collection('public_profiles')
    .orderBy('name', 'asc')
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => publicProfiles.push(doc.data()))
    })

  console.log(
    'returning public profiles:',
    publicProfiles.map(i => i.id)
  )

  return publicProfiles
}
