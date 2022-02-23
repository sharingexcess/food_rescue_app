const {
  db,
  fetchDocument,
  formatLocationAsAddressString,
} = require('../helpers')
require('dotenv').config()

exports.rescueOnWrite = async event => {
  const { google } = require('googleapis')
  console.log('Received rescue onWrite event:', event, process.env)

  const google_auth_credentials = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })
  await google_auth_credentials.authorize()

  // if existing calendar event, delete it
  // TODO: parse existing calendar event id from event
  const existing_google_calendar_event_id = ''
  if (existing_google_calendar_event_id) {
    await deleteGoogleCalendarEvent(
      existing_google_calendar_event_id,
      google_auth_credentials
    )
  }

  // create google calendar event
  const google_calendar_event_id = await createGoogleCalendarEvent(
    event,
    google_auth_credentials
  )
  console.log(
    'Successfully created Google Calendar Event with id:',
    google_calendar_event_id
  )

  // calculate distance for route
  const total_driving_distance = await calculateRescueTotalDistance(event)
  console.log('Successfully calculated route distance:', total_driving_distance)

  // update DB with distance and event id

  // TODO: parse rescue_id from event
  const rescue_id = ''
  await db
    .collection('rescues')
    .doc(rescue_id)
    .set({ google_calendar_event_id, total_driving_distance }, { merge: true })

  console.log('Successfully ran rescueOnWrite!')
}

function createGoogleCalendarEvent(event, google_auth_credentials) {
  console.log('Creating Google Calendar Event from onWrite event:', event)
  return new Promise(function (resolve, reject) {
    // TODO: parse resource fields from event
    const resource = {
      summary: '',
      location: '',
      description: '',
      start: '',
      end: '',
      attendees: '',
    }

    calendar.events.insert(
      {
        auth: google_auth_credentials,
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        resource: resource,
      },
      (err, res) => {
        if (err) {
          console.log('Rejecting because of error', err)
          reject(err)
        } else {
          console.log('Request successful', res, res.data)
          resolve(res.data.id)
        }
      }
    )
  })
}

function deleteGoogleCalendarEvent(event_id, google_auth_credentials) {
  console.log('Deleting Event:', event_id)

  return new Promise(function (resolve, reject) {
    calendar.events.delete(
      {
        auth: google_auth_credentials,
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        eventId: event_id,
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

async function calculateRescueTotalDistance(event) {
  console.log('Running calculateRescueTotalDistance with input:', event)

  // TODO: parse stop_ids from event
  const stop_ids = []
  const locations = []

  for (const id of stop_ids) {
    const stop = await fetchDocument('stops', id)
    const location = await fetchDocument('locations', stop.location_id)
    stop_addresses.push(formatLocationAsAddressString(location))
  }

  const base_url =
    'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial'
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY

  let total_distance = 0
  let curr_location = locations.shift()

  while (locations.length) {
    const full_url = `
      ${base_url}&key=${API_KEY}
      &origins=${encodeURIComponent(curr_location)}
      &destinations=${encodeURIComponent(locations[0])}
    `

    const response = await fetch(full_url).then(res => res.json())
    const distance = parseFloat(
      response.rows[0].elements[0].distance.text.split(' ')[0]
    )

    console.log(distance)
    total_distance += distance
    curr_location = locations.shift()
  }

  console.log(total_distance, 'miles')
  return total_distance
}
