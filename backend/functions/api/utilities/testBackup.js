const {
  db,
  COLLECTIONS,
  formatDocumentTimestamps,
} = require('../../../helpers')
const moment = require('moment')
const fs = require('fs')
const { cache_retool_data } = require('../../cache_retool_data')

exports.testBackup = async (_request, response) => {
  await cache_retool_data()
  console.log('done')
  response.status(200).send()
}
