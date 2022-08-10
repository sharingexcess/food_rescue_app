const { google } = require('googleapis')
const calendar = google.calendar('v3')
const {
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')

async function deleteCalendarEventEndpoint(request, response) {
  console.log(
    'INVOKING ENDPOINT: deleteCalendarEvent()\n',
    'params:',
    JSON.parse(request.body)
  )

  const requestIsAuthenticated = await authenticateRequest(
    request.get('accessToken'),
    user => user.is_admin
  )

  if (!requestIsAuthenticated) {
    rejectUnauthorizedRequest(response)
    return
  }

  const { eventId } = JSON.parse(request.body)

  deleteEvent(eventId)
    .then(data => {
      response.status(200).send(data)
      return
    })
    .catch(err => {
      console.error('Error adding event: ' + err.message)
      response.status(500).send('There was an error with Google calendar')
      return
    })
}

async function deleteEvent(eventId) {
  console.log('Deleting Event:', eventId)

  // loading this key from an ENV var messes up line break formatting
  // need the replace() to format properly
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(
    /\\n/gm,
    '\n'
  )

  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    key,
    ['https://www.googleapis.com/auth/calendar.events'],
    process.env.GOOGLE_SERVICE_ACCOUNT_SUBJECT
  )

  const res = await new Promise(resolve => {
    calendar.events.delete(
      { auth, calendarId: process.env.GOOGLE_CALENDAR_ID, eventId },
      (err, res) => {
        if (err) {
          console.log('Caught error:', err)
          resolve(err)
        } else {
          console.log('Request successful', res)
          resolve(res.data)
        }
      }
    )
  })
  return res
}

exports.deleteCalendarEventEndpoint = deleteCalendarEventEndpoint
exports.deleteEvent = deleteEvent
