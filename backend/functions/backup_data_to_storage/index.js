const moment = require('moment-timezone')
const { COLLECTIONS } = require('../../helpers')
const { fetchCollection, uploadFile } = require('../../helpers/functions')

exports.backup_data_to_storage = async () => {
  const date = moment(new Date()).format('yyyy-MM-DD')

  for (const collection of Object.values(COLLECTIONS)) {
    const data = await fetchCollection(collection)
    console.log('Fetched', collection, data.length, 'rows')

    const jsonlData = data.map(d => JSON.stringify(d)).join('\n')
    const jsonlPath = `backup/${date}/${collection}.jsonl`
    uploadFile(jsonlPath, jsonlData)
  }
  console.log('done!')
}
