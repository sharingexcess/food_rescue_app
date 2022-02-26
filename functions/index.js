const functions = require('firebase-functions')
const { backup } = require('./backup')
const { myStats } = require('./myStats')
const { api } = require('./api')

// exports.calendar = functions.https.onRequest(calendar)

exports.api = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '4GB',
  })
  .https.onRequest(api)

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
