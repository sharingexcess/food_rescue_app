const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')
<<<<<<< HEAD
const { analytics } = require('./analytics')
const { writeToGoogleSheets } = require('./writeToGoogleSheets')
const { addCalendarEvent, deleteCalendarEvent } = require('./calendar')
=======
const googleCredentials = require('./credentials.json')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const calendar = google.calendar('v3')
const sheets = google.sheets('v4')
const is_prod = process.env.GCLOUD_PROJECT === 'sharing-excess-prod'
const spreadsheetId = is_prod
  ? '1wmcOySR3EhHezgFn0o3suf7RZFDh62secue3jpbPK4Q'
  : '16bn0SYmKu7YnTI1yB5NiMzHhq3E0ZkDzCnfeh0v1AeI'
const serviceAccountKey = is_prod
  ? './serviceAccountProd.json'
  : './serviceAccountDev.json'
const serviceAccount = require(serviceAccountKey)
const moment = require('moment-timezone')

const jwtClient = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const jwtAuthPromise = jwtClient.authorize()

const ERROR_RESPONSE = {
  status: '500',
  message: 'There was an error with your Google calendar',
}
const admin = require('firebase-admin')
admin.initializeApp()
const fs = require('fs')
const db = admin.firestore()
const storage = admin.storage()
const bucketRef = storage.bucket()
>>>>>>> e713481 (Completed Saving Json Files to Storage)

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

async function backUpToStorage(request, response) {
  const COLLECTIONS = [
    'locations',
    'organizations',
    'rescues',
    'stops',
    'users',
  ]
  const date = moment(new Date()).format('yyyy/MM/DD')

  for (const collection of COLLECTIONS) {
    const data = []
    await db
      .collection(collection)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          data.push(doc.data())
        })
      })
    const jsonData = JSON.stringify(data)
    fs.writeFile(`${collection}temp.json`, jsonData, err => {
      if (err) throw err
      console.log('File created')
    })

    const options = { destination: `backup/${date}/${collection}.json` }
    await bucketRef.upload(`${collection}temp.json`, options, err => {
      if (err) {
        throw err
      }
      console.log('File uploaded to Storage')
      fs.unlinkSync(`${collection}temp.json`)
    })
  }
  response.status(200).send('Done')
}

exports.backend = functions.https.onRequest(backend_routes)

// exports.backupToStorage = functions.pubsub
//   .schedule('02 00 * * 0')
//   .timeZone('America/New_York')
//   .onRun(() => {
//   const COLLECTIONS = [
//     'locations',
//     'organizations',
//     'rescues',
//     'stops',
//     'users',
//   ]
//   const date = moment(new Date()).format('yyyy/MM/DD')

//   for (const collection of COLLECTIONS) {
//     const data = []
//     await db
//       .collection(collection)
//       .get()
//       .then(querySnapshot => {
//         querySnapshot.forEach(doc => {
//           data.push(doc.data())
//         })
//       })
//     const jsonData = JSON.stringify(data)
//     fs.writeFile(`${collection}temp.json`, jsonData, err => {
//       if (err) throw err
//       console.log('File created')
//     })

//     const options = { destination: `backup/${date}/${collection}.json` }
//     await bucketRef.upload(`${collection}temp.json`, options, err => {
//       if (err) {
//         throw err
//       }
//       console.log('File uploaded to Storage')
//       fs.unlinkSync(`${collection}temp.json`)
//     })
//   }
// })
>>>>>>> 023a05c (Function for Backup)
