const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')
const { analytics } = require('./analytics')
const { writeToGoogleSheets } = require('./writeToGoogleSheets')
const { addCalendarEvent, deleteCalendarEvent } = require('./calendar')

const fs = require('fs')
const moment = require('moment-timezone')
const { fetchCollection, uploadFile } = require('./helpers')

exports.writeToGoogleSheets = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '4GB',
  })
  .pubsub.schedule('01 00 * * *') // run every day at 12:01am (00:01)
  .timeZone('America/New_York')
  .onRun(writeToGoogleSheets)

const backend_routes = express()
backend_routes.use(cors({ origin: true }))

backend_routes.post('/addCalendarEvent', addCalendarEvent)
backend_routes.post('/deleteCalendarEvent', deleteCalendarEvent)
backend_routes.post('/backUpToStorage', backUpToStorage)

const calendar_routes = express()
calendar_routes.use(cors({ origin: true }))

calendar_routes.post('/add', addCalendarEvent)
calendar_routes.post('/delete', deleteCalendarEvent)

const analytics_routes = express()
analytics_routes.use(cors({ origin: true }))
analytics_routes.get('/', analytics)

exports.backend = functions.https.onRequest(backend_routes)

exports.calendar = functions.https.onRequest(calendar_routes)

exports.analytics = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '4GB',
  })
  .https.onRequest(analytics_routes)

exports.backend = functions.https.onRequest(backend_routes)

function backUpToStorage(request, response) {
  const COLLECTIONS = [
    'locations',
    'organizations',
    'rescues',
    'stops',
    'users',
  ]
  const date = moment(new Date()).format('yyyy/MM/DD')

  for (const collection of COLLECTIONS) {
    const data = fetchCollection(collection)
    const jsonData = JSON.stringify(data)
    fs.writeFile(`${collection}temp.json`, jsonData, err => {
      if (err) throw err
      console.log('File created')
    })

    const options = { destination: `backup/${date}/${collection}.json` }
    const filePath = `${collection}temp.json`

    uploadFile(filePath, options, true)
  }
  response.status(200).send('Done')
}
// exports.backupToStorage = functions.pubsub
//   .schedule('02 00 * * 0')
//   .timeZone('America/New_York')
//   .onRun(() => {
//
// })
