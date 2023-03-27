const {
  db,
  COLLECTIONS,
  formatDocumentTimestamps,
  RESCUE_TYPES,
  STATUSES,
} = require('../../../helpers')
const moment = require('moment')
const { isValidRescuePayload } = require('./isValidRescuePayload')
const fs = require('fs')

exports.migrateRescues = async (_request, response) => {
  const collectionsRef = db.collection('legacy_rescues')
  const batch_size = 252
  const max_batches = 8
  let batch_index = 0
  let last_doc_ref = null
  const first_doc_id = 'u015fvh6hiy9'
  let count = 0
  let shouldBreak
  const skipped = []

  if (first_doc_id) {
    // If we have an ID to start from, get a reference to that document,
    // and set last_doc_ref to that doc so that the query grabs it below
    last_doc_ref = await db.collection('legacy_rescues').doc(first_doc_id).get()
  }

  const query = collectionsRef.orderBy('id').limit(batch_size)

  async function getPage() {
    const rescues = []

    // get rescues
    const currQuery = last_doc_ref ? query.startAfter(last_doc_ref) : query
    await currQuery.get().then(snapshot => {
      console.log('QUERY RESULT SIZE', snapshot.docs.length)

      last_doc_ref = snapshot.docs[snapshot.docs.length - 1]
      last_doc_ref && console.log('LAST DOC ID:', last_doc_ref.data().id)

      if (snapshot.docs.length < batch_size) shouldBreak = true
      snapshot.forEach(doc => {
        const rescue = doc.data()
        rescues.push(formatDocumentTimestamps(rescue))
      })
    })

    return rescues
  }

  while (batch_index < max_batches) {
    const current_page = await getPage()
    const batch = db.batch()
    let batchPopulated = false

    for (const legacy_rescue of current_page) {
      batchPopulated = true
      const rescue = {
        id: legacy_rescue.id,
        type: legacy_rescue.type || RESCUE_TYPES.RETAIL,
        status: legacy_rescue.status,
        handler_id: legacy_rescue.handler_id,
        google_calendar_event_id:
          legacy_rescue.google_calendar_event_id || null,
        notes: legacy_rescue.notes || '',
        transfer_ids: legacy_rescue.transfer_ids,
        timestamp_created: moment(
          legacy_rescue.timestamp_created
        ).toISOString(),
        timestamp_updated: moment().toISOString(),
        timestamp_scheduled: moment(
          legacy_rescue.timestamp_scheduled
        ).toISOString(),
        timestamp_completed: [STATUSES.ACTIVE, STATUSES.SCHEDULED].includes(
          legacy_rescue.status
        )
          ? null
          : moment(legacy_rescue.timestamp_updated).toISOString(),
      }

      // console.log('legacy_rescue:', legacy_rescue)

      if (!(await isValidRescuePayload(rescue))) {
        console.log('\n\n\n\n\n\nSKIPPING Invalid Rescue...')
        skipped.push(rescue)
      } else {
        console.log('Adding valid rescue to batch...')
        batch.set(db.collection(COLLECTIONS.RESCUES).doc(rescue.id), rescue)
      }
    }
    if (batchPopulated) {
      await batch.commit().then(() => console.log('completed batch update.'))
    }
    count += current_page.length
    console.log(
      `BATCH: ${batch_index} - HANDLED: ${count} - SKIPPED ${
        skipped.length
      } - LAST DOC: ${last_doc_ref.data().id}`
    )
    batch_index++
    if (shouldBreak) break
  }

  addSkippedStopsToJSONFile(skipped)

  const all_legacy_rescues_count = await db
    .collection('legacy_rescues')
    .count()
    .get()
  const all_rescues_count = await db.collection('rescues').count().get()

  console.log(
    all_legacy_rescues_count.data().count,
    'total legacy',
    all_rescues_count.data().count,
    'total rescues'
  )

  console.log('done.')

  response.status(200).send()
}

function addSkippedStopsToJSONFile(skipped) {
  const path = './functions/api/rescues/_SKIPPED.json'
  console.log('Writing skipped to file...')
  const data = fs.readFileSync(path)
  const json = JSON.parse(data)
  json.push(...skipped)
  fs.writeFileSync(path, JSON.stringify(json))
  console.log('File write successful.')
}
