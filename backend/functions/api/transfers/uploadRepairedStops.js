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

exports.uploadRepairedStops = async (_request, response) => {
  const batch_size = 50
  let batch_index = 0
  let count = 0
  const skipped = []
  let last_index = 0

  // read and dedupe
  const transfers = JSON.parse(
    fs.readFileSync('./functions/api/transfers/_IN_REPAIR.json')
  ).filter(
    (value, index, self) => index === self.findIndex(t => t.id === value.id)
  )

  while (last_index < transfers.length) {
    const current_transfers = transfers.slice(
      last_index,
      last_index + batch_size
    )
    last_index += batch_size

    const batch = db.batch()
    const now = new Date().toISOString()

    for (const transfer of current_transfers) {
      transfer.timestamp_updated = now
      transfer.handler_id = 'sUqgP36KAiPgDaU7V4z8N0GirIc2'

      const is_valid = await isValidTransferPayload(transfer)
      if (is_valid) {
        console.log('Adding valid transfer to batch:', transfer.id)
        // update parent rescue
        const rescue = await getRescue(transfer.rescue_id, { shallow: true })
        batch.set(
          db.collection('legacy_rescues').doc(rescue.id),
          {
            handler_id: 'sUqgP36KAiPgDaU7V4z8N0GirIc2',
            timestamp_updated: now,
          },
          { merge: true }
        )
        // update other transfers in rescue
        for (const transfer_id of rescue.stop_ids) {
          const t = await getTransfer(transfer_id, { shallow: true })
          if (t && t.id !== transfer.id) {
            batch.set(
              db.collection(COLLECTIONS.TRANSFERS).doc(t.id),
              {
                handler_id: 'sUqgP36KAiPgDaU7V4z8N0GirIc2',
                timestamp_updated: now,
              },
              { merge: true }
            )
          }
        }
        // create new transfer
        batch.set(
          db.collection(COLLECTIONS.TRANSFERS).doc(transfer.id),
          transfer
        )
      } else {
        console.log('\n\n\n\n\n\nSKIPPING Invalid Transfer ^^')
        skipped.push(transfer)
      }
    }

    await batch.commit().then(() => console.log('completed batch update.'))

    count += current_transfers.length

    console.log(
      `BATCH: ${batch_index} - HANDLED: ${count} - SKIPPED ${skipped.length}`
    )
    batch_index++
  }

  addSkippedStopsToJSONFile(skipped)

  const all_transfers_count = await db.collection('transfers').count().get()

  console.log(
    transfers.length,
    'for upload',
    all_transfers_count.data().count,
    'uploaded'
  )

  console.log('done.')

  response.status(200).send()
}

function addSkippedStopsToJSONFile(skipped) {
  const path = './functions/api/transfers/_SKIPPED_AFTER_REPAIR.json'
  console.log('Writing skipped to _SKIPPED_2.json...')
  const data = fs.readFileSync(path)
  const json = JSON.parse(data)
  json.push(...skipped)
  fs.writeFileSync(path, JSON.stringify(json))
  console.log('File write successful.')
}
