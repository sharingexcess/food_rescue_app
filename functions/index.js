const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')
const { analytics } = require('./analytics')
const { writeToGoogleSheets } = require('./writeToGoogleSheets')
const { addCalendarEvent, deleteCalendarEvent } = require('./calendar')

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
