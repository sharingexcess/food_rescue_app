const functions = require('firebase-functions')
const { api } = require('./functions/api')
const { backup_data_to_storage } = require('./functions/backup_data_to_storage')
const { cache_retool_data } = require('./functions/cache_retool_data')
const { import_to_bigquery } = require('./functions/import_to_bigquery')

exports.api = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '8GB',
    minInstances: 0,
    maxInstances: 10,
  })
  .https.onRequest(api)

exports.backup_data_to_storage = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '4GB',
  })
  .pubsub.schedule('01 0 * * *') // run every day at 12:01am (00:01)
  .timeZone('America/New_York')
  .onRun(backup_data_to_storage)

exports.cache_retool_data = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '4GB',
  })
  .pubsub.schedule('01 0 * * *') // run every day at 12:01am (00:01)
  .timeZone('America/New_York')
  .onRun(cache_retool_data)

exports.import_to_bigquery = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '4GB',
  })
  .pubsub.schedule('30 0 * * *') // run every day at 12:30am
  .timeZone('America/New_York')
  .onRun(import_to_bigquery)
