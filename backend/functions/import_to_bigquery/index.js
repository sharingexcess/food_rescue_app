const moment = require('moment-timezone')
const { uploadFileToBigQuery } = require('../../helpers/functions')

exports.import_to_bigquery = async () => {
  const date = moment(new Date()).format('yyyy-MM-DD')

  const fileNames = [
    'locations.jsonl',
    'organizations.jsonl',
    'rescues.jsonl',
    'transfers.jsonl',
  ]

  await uploadFileToBigQuery(fileNames, date)

  console.log('Donezo!')
}
