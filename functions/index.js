const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const cors = require('cors')
const googleCredentials = require('./credentials.json')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const calendar = google.calendar('v3')
const ERROR_RESPONSE = {
  status: '500',
  message: 'There was an error with your Google calendar',
}

admin.initializeApp()
const backend_routes = express()
backend_routes.use(cors({ origin: true }))

backend_routes.get('/isUserAdmin', isUserAdmin)
backend_routes.post('/setUserAdmin', setUserAdmin)
backend_routes.get('/isUserBasicAccess', isUserBasicAccess)
backend_routes.post('/setUserBasicAccess', setUserBasicAccess)
backend_routes.post('/addCalendarEvent', addCalendarEvent)
backend_routes.post('/deleteCalendarEvent', deleteCalendarEvent)

function setUserAdmin(req, res) {
  console.log(
    '\nReceived request to setUserAdmin:\n',
    req.query.id,
    req.query.admin
  )
  const new_admin_value = req.query.admin === 'true' ? true : false
  return admin
    .auth()
    .getUser(req.query.id)
    .then(user => {
      console.log('got user')
      return admin
        .auth()
        .setCustomUserClaims(user.uid, {
          admin: new_admin_value,
        })
        .then(data => {
          console.log('successfully updated admin permissions', data)
          res.send({ id: req.query.id, admin: new_admin_value })
        })
        .catch(e => {
          console.log('error creating new admin:', e)
          res.send({ error: e })
        })
    })
    .catch(e => console.log('could not find user:', e))
}

function setUserBasicAccess(req, res) {
  console.log(
    '\nReceived request to setUserBasicAccess:\n',
    req.query.id,
    req.query.admin
  )
  const new_basic_access_value =
    req.query.basic_access === 'true' ? true : false
  return admin
    .auth()
    .getUser(req.query.id)
    .then(user => {
      console.log('got user')
      return admin
        .auth()
        .setCustomUserClaims(user.uid, {
          basic_access: new_basic_access_value,
        })
        .then(data => {
          console.log('successfully updated basic access', data)
          res.send({ id: req.query.id, basic_access: new_basic_access_value })
        })
        .catch(e => {
          console.log('error updating admin:', e)
          res.send({ error: e })
        })
    })
    .catch(e => console.log('could not find user:', e))
}

function isUserAdmin(req, res) {
  console.log('\nReceived request to isUserAdmin:\n', req.query.id)
  admin
    .auth()
    .getUser(req.query.id)
    .then(userRecord => {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log(
        `Successfully fetched user data:`,
        userRecord,
        userRecord.customClaims
      )
      res.send(userRecord.customClaims ? userRecord.customClaims.admin : false)
    })
    .catch(error => {
      console.log('Error fetching user data:', error)
      res.send('could not find user')
    })
}

function isUserBasicAccess(req, res) {
  console.log('\nReceived request to isUserAdmin:\n', req.query.id)
  admin
    .auth()
    .getUser(req.query.id)
    .then(userRecord => {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log(
        `Successfully fetched user data:`,
        userRecord,
        userRecord.customClaims
      )
      res.send(
        userRecord.customClaims ? userRecord.customClaims.basic_access : false
      )
    })
    .catch(error => {
      console.log('Error fetching user data:', error)
      res.send('could not find user')
    })
}

function addEvent(resource, auth) {
  console.log('\n\n\n\nAdding Event:', resource)
  return new Promise(function (resolve, reject) {
    const event = {
      summary: resource.summary,
      location: resource.location,
      description: resource.description,
      start: resource.start,
      end: resource.end,
      attendees: resource.attendees,
    }

    calendar.events.insert(
      {
        auth,
        calendarId: resource.calendarId,
        resource: event,
      },
      (err, res) => {
        if (err) {
          console.log('Rejecting because of error', err)
          reject(err)
        } else {
          console.log('Request successful', res)
          resolve(res.data)
        }
      }
    )
  })
}

function deleteEvent(calendarId, eventId, auth) {
  console.log('Deleting Event:', eventId)
  return new Promise(function (resolve, reject) {
    calendar.events.delete({ auth, calendarId, eventId }, (err, res) => {
      if (err) {
        console.log('Rejecting because of error', err)
        reject(err)
      } else {
        console.log('Request successful', res)
        resolve(res.data)
      }
    })
  })
}

function addCalendarEvent(request, response) {
  const oAuth2Client = new OAuth2(
    googleCredentials.web.client_id,
    googleCredentials.web.client_secret,
    googleCredentials.web.redirect_uris[0]
  )

  oAuth2Client.setCredentials({
    refresh_token: googleCredentials.refresh_token,
  })

  addEvent(JSON.parse(request.body), oAuth2Client)
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

function deleteCalendarEvent(request, response) {
  const oAuth2Client = new OAuth2(
    googleCredentials.web.client_id,
    googleCredentials.web.client_secret,
    googleCredentials.web.redirect_uris[0]
  )

  oAuth2Client.setCredentials({
    refresh_token: googleCredentials.refresh_token,
  })
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
