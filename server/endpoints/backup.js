const moment = require('moment-timezone')
const { fetchCollection, uploadFile } = require('./helpers')
require('dotenv').config()

exports.backup = async () => {
  const COLLECTIONS = [
    'locations',
    'organizations',
    'rescues',
    'stops',
    'users',
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
