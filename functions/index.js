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
<<<<<<< HEAD
  .https.onRequest(analytics_routes)
=======
  const { calendarId, eventId } = JSON.parse(request.body)

  deleteEvent(calendarId, eventId, oAuth2Client)
    .then(data => {
      response.status(200).send(data)
      return
    })
    .catch(err => {
      console.error('Error adding event: ' + err.message)
      response.status(500).send(ERROR_RESPONSE)
      return
    })
}

exports.backend = functions.https.onRequest(backend_routes)

exports.backupToStorage = functions.pubsub
  .schedule('02 00 * * 0')
  .timeZone('America/New_York')
  .onRun(() => {
    // const { Storage } = require('@google-cloud/storage')
    const storage = admin.storage().ref()
    // const bucket = storage.bucket('')

    const COLLECTIONS = [
      'locations',
      'organizations',
      'rescues',
      'stops',
      'users',
    ]

    const today = new Date()
    const date =
      today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()

    COLLECTIONS.forEach(collection => {
      // const options = {
      //   destination: `${date}/${collection}.json`,
      // }
      const data = db.collection(collection).get()
      const jsonData = JSON.stringify(data)

      const blob = new Blob([jsonData], { type: 'application/json' })

      const fileRef = storage.child(
        `gs://sharing-excess-7e887.appspot.com/${date}/${collection}.json`
      )

      fileRef.put(blob)
    })
  })

// exports.backupToStorage = functions.https.onRequest((request, response) => {
//   const data = db.collection('locations').get()

//   response.send(JSON.stringify(data))

//   return true.catch(error => {
//     console.error('Error adding document: ', error)
//     return false
//   })
// })
>>>>>>> 023a05c (Function for Backup)
