const googleCredentials = require('../../credentials/credentials.json')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const calendar = google.calendar('v3')

const ERROR_RESPONSE = {
  status: '500',
  message: 'There was an error with your Google calendar',
}

exports.add_calendar_event = (request, response) => {
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
