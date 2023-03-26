const { db, COLLECTIONS, formatDocumentTimestamps } = require('../../helpers')
const moment = require('moment')
const fs = require('fs')

exports.migratePublicProfiles = async (_request, response) => {
  const src_collection = 'legacy_public_profiles'
  const dest_collection = COLLECTIONS.PUBLIC_PROFILES
  const collectionsRef = db.collection(src_collection)
  const batch_size = 250
  const max_batches = 8
  let batch_index = 0
  let last_doc_ref = null
  const first_doc_id = null
  let count = 0
  let shouldBreak
  const skipped = []

  if (first_doc_id) {
    // If we have an ID to start from, get a reference to that document,
    // and set last_doc_ref to that doc so that the query grabs it below
    last_doc_ref = await db.collection(src_collection).doc(first_doc_id).get()
  }

  const query = collectionsRef
    // .orderBy('id')
    .limit(batch_size)

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
    const current_page = await getPage()
    const batch = db.batch()
    let batchPopulated = false
    for (const legacy_record of current_page) {
      if (!legacy_record.id) console.log(legacy_record)
      batchPopulated = true
      const new_record = {
        ...legacy_record,
        timestamp_created: moment
          .utc(legacy_record.timestamp_created || new Date())
          .toISOString(),
        timestamp_updated: moment
          .utc(legacy_record.timestamp_updated || new Date())
          .toISOString(),
      }
      // console.log('Adding to batch:', new_record)
      new_record.id &&
        batch.set(db.collection(dest_collection).doc(new_record.id), new_record)
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

  const src_count = await db.collection(src_collection).count().get()
  const dest_count = await db.collection(dest_collection).count().get()

  console.log(
    src_count.data().count,
    'total src',
    dest_count.data().count,
    'total dest'
  )

  console.log('done.')

  response.status(200).send()
}
