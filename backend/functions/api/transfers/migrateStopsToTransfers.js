const {
  db,
  COLLECTIONS,
  formatDocumentTimestamps,
} = require('../../../helpers')
const moment = require('moment')
const { isValidTransferPayload } = require('./isValidTransferPayload')
const fs = require('fs')

exports.migrateStopsToTransfers = async (_request, response) => {
  const collectionsRef = db.collection('stops')
  const batch_size = 250
  const max_batches = 8
  let batch_index = 0
  let last_doc_ref = null
  const first_doc_id = 'zzznkrb4nir7'
  let count = 0
  let shouldBreak
  const skipped = []

  if (first_doc_id) {
    // If we have an ID to start from, get a reference to that document,
    // and set last_doc_ref to that doc so that the query grabs it below
    last_doc_ref = await db.collection('stops').doc(first_doc_id).get()
  }

  const query = collectionsRef.orderBy('id').limit(batch_size)

  async function getPage() {
    const stops = []

    // get stops
    const currQuery = last_doc_ref ? query.startAfter(last_doc_ref) : query
    await currQuery.get().then(snapshot => {
      console.log('QUERY RESULT SIZE', snapshot.docs.length)

      last_doc_ref = snapshot.docs[snapshot.docs.length - 1]
      last_doc_ref && console.log('LAST DOC ID:', last_doc_ref.data().id)

      if (snapshot.docs.length < batch_size) shouldBreak = true
      snapshot.forEach(doc => {
        const stop = doc.data()
        stops.push(formatDocumentTimestamps(stop))
      })
    })

    return stops
  }

  while (batch_index < max_batches) {
    const current_stops = await getPage()
    const batch = db.batch()
    let batchPopulated = false
    for (const stop of current_stops) {
      batchPopulated = true
      const transfer = {
        id: stop.id,
        type: stop.type === 'pickup' ? 'collection' : 'distribution',
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
        skipped.push(transfer)
      } else {
        console.log('Adding valid transfer to batch:', transfer)
        batch.set(
          db.collection(COLLECTIONS.TRANSFERS).doc(transfer.id),
          transfer
        )
      }
    }
    if (batchPopulated) {
      await batch.commit().then(() => console.log('completed batch update.'))
    }
    count += current_stops.length
    console.log(
      `BATCH: ${batch_index} - HANDLED: ${count} - SKIPPED ${
        skipped.length
      } - LAST DOC: ${last_doc_ref.data().id}`
    )
    batch_index++
    if (shouldBreak) break
  }

  addSkippedStopsToJSONFile(skipped)

  const all_stops_count = await db.collection('stops').count().get()
  const all_transfers_count = await db.collection('transfers').count().get()

  console.log(
    all_stops_count.data().count,
    'total stops',
    all_transfers_count.data().count,
    'total transfers'
  )

  console.log('done.')

  response.status(200).send()
}

function addSkippedStopsToJSONFile(skipped) {
  const path = './functions/api/transfers/SKIPPED_STOPS.json'
  console.log('Writing skipped to SKIPPED_STOPS.json...')
  const data = fs.readFileSync(path)
  const json = JSON.parse(data)
  json.skipped_stops.push(...skipped)
  fs.writeFileSync(path, JSON.stringify(json))
  console.log('File write successful.')
}
