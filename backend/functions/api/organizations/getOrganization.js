const { performance } = require('perf_hooks')
const {
  db,
  formatDocumentTimestamps,
  COLLECTIONS,
} = require('../../../helpers')

exports.getOrganization = async (id, options = { shallow: false }) => {
  const organization = await db
    .collection(COLLECTIONS.ORGANIZATIONS)
    .doc(id)
    .get()
    .then(doc => doc.data())

  console.log('Found organization:', organization)

  // if only the organization object is needed with no "joined"/nested data, allow return early for performance
  if (options.shallow) {
    console.log('returning shallow organization:', organization)
    return organization
  }

  organization.locations = []
  await db
    .collection(COLLECTIONS.LOCATIONS)
    .where('organization_id', '==', id)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        if (!doc.data().is_deleted) {
          organization.locations.push({
            ...formatDocumentTimestamps(doc.data()),
            stops: [],
          })
        }
      })
    })

  console.log('returning organization:', organization)

  return organization
}
