const { google } = require('googleapis')
const calendar = google.calendar('v3')
const {
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')

async function addCalendarEventEndpoint(request, response) {
  console.log(
    'INVOKING ENDPOINT: addCalendarEvent()\n',
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

  addEvent(JSON.parse(request.body))
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

async function addEvent(resource) {
  console.log('Adding Event:', resource)
  return new Promise(async (resolve, reject) => {
    const event = {
      summary: resource.summary,
      location: resource.location,
      description: resource.description,
      start: resource.start,
      end: resource.end,
      attendees: resource.attendees,
    }

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

    calendar.events.insert(
      {
        auth: auth,
        calendarId: process.env.GOOGLE_CALENDAR_ID,
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

exports.addCalendarEventEndpoint = addCalendarEventEndpoint
exports.addCalendarEvent = addEvent
