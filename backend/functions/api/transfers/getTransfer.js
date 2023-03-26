const { formatDocumentTimestamps, db } = require('../../../helpers')

exports.getTransfer = async (id, options = { shallow: false }) => {
  const transfer = await db
    .collection('transfers')
    .doc(id)
    .get()
    .then(doc => doc.data())

  if (!transfer) return null

  console.log('Got transfer:', transfer)

  // if only the transfer object is needed with no "joined"/nested data, allow return early for performance
  if (options.shallow) {
    console.log('returning shallow transfer:', transfer)
    return transfer
  }

  // populate organization and location for each transfer
  const metadata_promises = [
    db
      .collection('organizations')
      .doc(transfer.organization_id)
      .get()
      .then(doc => {
        const payload = doc.data()
        transfer.organization = formatDocumentTimestamps(payload)
      }),
    db
      .collection('locations')
      .doc(transfer.location_id)
      .get()
      .then(doc => {
        const payload = doc.data()
        transfer.location = formatDocumentTimestamps(payload)
      }),
  ]
  await Promise.all(metadata_promises)

  console.log('returning transfer:', transfer)
  return transfer
}
