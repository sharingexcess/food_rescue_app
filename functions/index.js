const functions = require('firebase-functions')
const { writeToGoogleSheets } = require('./writeToGoogleSheets')
const { backup } = require('./backup')
const { calendar } = require('./calendar')
const { analytics } = require('./analytics')
const { myStats } = require('./myStats')

exports.calendar = functions.https.onRequest(calendar)

exports.analytics = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '4GB',
  })
  .https.onRequest(analytics)

exports.myStats = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '4GB',
  })
  .https.onRequest(myStats)

exports.backup = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB',
  })
  .pubsub.schedule('01 0 * * *') // run every day at 12:01am (00:01)
  .timeZone('America/New_York')
  .onRun(backup)

exports.writeToGoogleSheets = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '4GB',
  })
  .pubsub.schedule('01 00 * * *') // run every day at 12:01am (00:01)
  .timeZone('America/New_York')
  .onRun(writeToGoogleSheets)
