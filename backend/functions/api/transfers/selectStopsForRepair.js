const { isValidTransferPayload } = require('./isValidTransferPayload')
const fs = require('fs')

exports.selectStopsForRepair = async (_request, response) => {
  const SKIPPED = []
  const IN_REPAIR = []

  const file_data = fs.readFileSync('./functions/api/transfers/_SKIPPED.json')
  const transfers = JSON.parse(file_data)
  console.log(transfers.length)

  for (const transfer of transfers.slice(0, 10000)) {
    // console.log('Transfer:', transfer)

    const is_valid = await isValidTransferPayload(transfer)
    console.log('is valid:', is_valid)

    if (is_valid) {
      console.log('\n\n\n\n\n\nAdding valid transfer to IN_REPAIR ^^')
      IN_REPAIR.push(transfer)
    } else {
      // console.log('SKIPPING Invalid Transfer ^^')
      SKIPPED.push(transfer)
    }
  }

  console.log(
    `HANDLED: ${transfers.length} - SKIPPED ${SKIPPED.length} - IN REPAIR: ${IN_REPAIR.length}`
  )

  addStopsToJSONFile(IN_REPAIR, './functions/api/transfers/_IN_REPAIR.json')

  // const all_stops_count = await db.collection('stops').count().get()
  // const all_transfers_count = await db.collection('transfers').count().get()

  // console.log(
  //   all_stops_count.data().count,
  //   'total stops',
  //   all_transfers_count.data().count,
  //   'total transfers'
  // )

  console.log('done.')

  response.status(200).send()
}

function addStopsToJSONFile(data_to_write, path) {
  console.log('Writing JSON to file...')
  const data = fs.readFileSync(path)
  const json = JSON.parse(data)
  json.push(...data_to_write)
  fs.writeFileSync(path, JSON.stringify(json))
  console.log('File write successful.')
}
