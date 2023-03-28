const {
  db,
  formatDocumentTimestamps,
  COLLECTIONS,
} = require('../../../helpers')

// NOTE: this is not an actual endpoint as of now. Just a helper function.

async function getLocation(id) {
  const location = await db
    .collection(COLLECTIONS.LOCATIONS)
    .doc(id)
    .get()
    .then(doc => formatDocumentTimestamps(doc.data()))

  console.log('returning location:', location)
  return location
}

exports.getLocation = getLocation
