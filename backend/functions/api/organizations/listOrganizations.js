const { db, COLLECTIONS } = require('../../../helpers')

exports.listOrganizations = async ({ type, subtype, tag }) => {
  let organizations = []

  let query = db.collection(COLLECTIONS.ORGANIZATIONS)

  if (type) {
    query = query.where('type', '==', type)
  }

  if (type && subtype) {
    query = query.where('subtype', '==', subtype)
  }

  if (tag) {
    query = query.where('tags', 'array-contains', tag)
  }

  await query
    .get()
    .then(snapshot => snapshot.forEach(doc => organizations.push(doc.data())))

  await Promise.all(
    organizations.map(async organization => {
      organization.locations = []
      await db
        .collection(COLLECTIONS.LOCATIONS)
        .where('organization_id', '==', organization.id)
        .get()
        .then(snapshot =>
          snapshot.forEach(doc => {
            const location = doc.data()
            // filter all deleted locations from list
            if (!location.is_deleted) {
              organization.locations.push(location)
            }
          })
        )
    })
  )

  // filter deleted organizations
  organizations = organizations.filter(i => !i.is_deleted)

  console.log(
    'returning organizations:',
    organizations.map(i => i.id)
  )

  return organizations
}
