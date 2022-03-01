const functions = require('firebase-functions')
const {
  api,
  backup_data_to_storage,
  export_data_to_google_sheets,
} = require('./functions')

exports.api = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '4GB',
  })
  .https.onRequest(api)

exports.backup_data_to_storage = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB',
  })
  .pubsub.schedule('01 0 * * *') // run every day at 12:01am (00:01)
  .timeZone('America/New_York')
  .onRun(backup_data_to_storage)

exports.export_data_to_google_sheets = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '4GB',
  })
  .pubsub.schedule('01 00 * * *') // run every day at 12:01am (00:01)
  .timeZone('America/New_York')
  .onRun(export_data_to_google_sheets)
