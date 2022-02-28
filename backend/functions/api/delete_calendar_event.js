const googleCredentials = require('../../credentials/credentials.json')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const calendar = google.calendar('v3')

const ERROR_RESPONSE = {
  status: '500',
  message: 'There was an error with your Google calendar',
}

exports.delete_calendar_event = (request, response) => {
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
