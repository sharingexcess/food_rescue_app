const {
  db,
  COLLECTIONS,
  formatDocumentTimestamps,
  STATUSES,
} = require('../../../helpers')
const moment = require('moment')
const { isValidTransferPayload } = require('./isValidTransferPayload')
const fs = require('fs')
const { getRescue } = require('../rescues/getRescue')
const { getTransfer } = require('./getTransfer')

exports.repairStops = async (_request, response) => {
  const batch_size = 50
  let batch_index = 0
  let count = 0
  const skipped = []
  let last_index = 0

  const deliveries = []
  await db
    .collection('legacy_stops')
    .where('type', '==', 'delivery')
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        deliveries.push(doc.data().id)
      })
    })

  console.log(deliveries.length, deliveries.slice(0, 10))

  while (last_index < deliveries.length) {
    const current_deliveries = deliveries.slice(
      last_index,
      last_index + batch_size
    )
    last_index += batch_size

    const batch = db.batch()
    const now = new Date().toISOString()

    for (const delivery of current_deliveries) {
      batch.set(
        db.collection(COLLECTIONS.TRANSFERS).doc(delivery),
        { type: 'distribution' },
        { merge: true }
      )
    }

    await batch.commit().then(() => console.log('completed batch update.'))

    count += current_deliveries.length

    console.log(
      `BATCH: ${batch_index} - HANDLED: ${count} - SKIPPED ${skipped.length}`
    )
    batch_index++
  }
  console.log('done.')

  response.status(200).send()
}
