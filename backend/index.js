const functions = require('firebase-functions')
const {
  api,
  backup_data_to_storage,
  cache_retool_data,
} = require('./functions')

exports.api = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '8GB',
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
