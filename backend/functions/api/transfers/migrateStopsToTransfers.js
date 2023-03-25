const {
  db,
  COLLECTIONS,
  formatDocumentTimestamps,
} = require('../../../helpers')
const moment = require('moment')
const { isValidTransferPayload } = require('./isValidTransferPayload')

exports.migrateStopsToTransfersEndpoint = async (_request, response) => {
  const collectionsRef = db.collection('stops')
  // .where('rescue_type', '==', 'wholesale')
  const pageSize = 250
  let lastDoc = null
  let count = 0
  let shouldBreak
  let batchNum = 1
  let skipCount = 0

  const query = collectionsRef.orderBy('id').limit(pageSize)

  async function getPage() {
    const stops = []

    // get stops
    const currQuery = lastDoc ? query.startAfter(lastDoc) : query
    await currQuery.get().then(snapshot => {
      console.log('QUERY RESULT SIZE', snapshot.docs.length)
      lastDoc = snapshot.docs[snapshot.docs.length - 1]
      lastDoc &&
        console.log(
          'LAST DOC ID:',
          snapshot.docs[snapshot.docs.length - 1].data().id
        )
      if (snapshot.docs.length < pageSize) shouldBreak = true
      snapshot.forEach(doc => {
        const stop = doc.data()
        stops.push(formatDocumentTimestamps(stop))
      })
    })

    return stops
  }

  while (batchNum < 2) {
    const current_stops = await getPage()
    const batch = db.batch()
    let batchPopulated = false
    for (const stop of current_stops) {
      batchPopulated = true
      const transfer = {
        id: stop.id,
        type: (stop.type = 'pickup' ? 'collection' : 'distribution'),
        status: stop.status === 'active' ? 'scheduled' : stop.status,
        rescue_id: stop.rescue_id,
        handler_id: stop.handler_id,
        organization_id: stop.organization_id,
        location_id: stop.location_id,
        notes: stop.notes || '',
        timestamp_created: moment(stop.timestamp_created).toISOString(),
        timestamp_updated: moment(stop.timestamp_updated).toISOString(),
        timestamp_completed: moment(stop.timestamp_updated).toISOString(),
        total_weight: stop.impact_data_total_weight,
        categorized_weight: {
          dairy: stop.impact_data_dairy,
          bakery: stop.impact_data_bakery,
          produce: stop.impact_data_produce,
          meat_fish: stop.impact_data_meat_fish,
          non_perishable: stop.impact_data_non_perishable,
          prepared_frozen: stop.impact_data_prepared_frozen,
          mixed: stop.impact_data_mixed,
          other: stop.impact_data_other,
        },
      }
      console.log('stop:', stop)
      if (!(await isValidTransferPayload(transfer))) {
        console.log('\n\n\n\n\n\nSKIPPING Invalid Transfer ^^')
        skipCount++
        // throw new Error('stopping for an invalid transfer')
      }
      batch.set(db.collection(COLLECTIONS.TRANSFERS).doc(transfer.id), transfer)
    }
    if (batchPopulated)
      // await batch.commit().then(() => console.log('completed batch update.'))

      count += current_stops.length
    console.log(
      'BATCH:',
      batchNum,
      '- HANDLED:',
      count,
      '- SKIPPED:',
      skipCount
    )
    batchNum++
    if (shouldBreak) break
  }

  console.log('done.')

  response.status(200).send()
}
