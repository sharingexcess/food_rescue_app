const { COLLECTIONS, db } = require('../../../helpers')

exports.getRescue = async (id, options = { shallow: false }) => {
  // load base rescue object from DB
  const rescue = await db
    .collection(COLLECTIONS.RESCUES)
    .doc(id)
    .get()
    .then(doc => doc.data())

  if (!rescue) {
    console.log(`No existing rescue found matching id: ${id}. Returning null.`)
    return null
  } else {
    console.log('Found existing rescue:', rescue)
  }

  // if only the rescue object is needed with no "joined"/nested data, allow return early
  if (options.shallow) {
    console.log(
      'Shallow option flag is true, returning without any additional data fetching.'
    )
    return rescue
  }

  // populate the full information for all transfers on the rescue
  const transfers = []
  await db
    .collection(COLLECTIONS.TRANSFERS)
    .where('rescue_id', '==', rescue.id)
    .get()
    .then(snapshot => snapshot.forEach(doc => transfers.push(doc.data())))

  // we have to do this map/find operation to ensure that the order of transfers is correct
  rescue.transfers = rescue.transfer_ids.map(id =>
    transfers.find(stop => stop.id === id)
  )

  console.log('Populated rescue transfers list:', rescue.transfers)

  // populate organization and location for each stop
  const metadata_promises = [
    // create a db request for each organization_id
    ...rescue.transfers.map((transfer, index) =>
      db
        .collection(COLLECTIONS.ORGANIZATIONS)
        .doc(transfer.organization_id)
        .get()
        .then(doc => {
          const payload = doc.data()
          rescue.transfers[index].organization = payload
        })
    ),
    // create a db request for each location_id
    ...rescue.transfers.map((transfer, index) =>
      db
        .collection(COLLECTIONS.LOCATIONS)
        .doc(transfer.location_id)
        .get()
        .then(doc => {
          const payload = doc.data()
          rescue.transfers[index].location = payload
        })
    ),
  ]

  if (rescue.handler_id) {
    // populate rescue with handler data if a handler_id exists
    metadata_promises.push(
      db
        .collection(COLLECTIONS.PUBLIC_PROFILES)
        .doc(rescue.handler_id)
        .get()
        .then(doc => {
          const payload = doc.data()
          rescue.handler = payload
        })
    )
  }

  await Promise.all(metadata_promises)

  console.log('Returning complete rescue object:', rescue)

  return rescue
}
