const moment = require('moment-timezone')
const { fetchCollection, uploadFile } = require('../../helpers/functions')

exports.backup_data_to_storage = async () => {
  const COLLECTIONS = [
    'locations',
    'organizations',
    'rescues',
    'stops',
    'public_profiles',
    'private_profiles',
  ]
  const date = moment(new Date()).format('yyyy-MM-DD')

  for (const collection of COLLECTIONS) {
    const data = await fetchCollection(collection)
    console.log('Fetched', collection, data.length, 'rows')
    const jsonData = JSON.stringify(data)
    const path = `backup/${date}/${collection}.json`
    uploadFile(path, jsonData)
  }
  console.log('done!')
}
