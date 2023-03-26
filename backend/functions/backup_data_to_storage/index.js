const moment = require('moment-timezone')
const { COLLECTIONS } = require('../../helpers')
const { fetchCollection, uploadFile } = require('../../helpers/functions')

exports.backup_data_to_storage = async () => {
  const date = moment(new Date()).format('yyyy-MM-DD')

  for (const collection of Object.values(COLLECTIONS)) {
    const data = await fetchCollection(collection)
    console.log('Fetched', collection, data.length, 'rows')
    const jsonData = JSON.stringify(data)
    const path = `backup/${date}/${collection}.json`
    uploadFile(path, jsonData)
  }
  console.log('done!')
}
