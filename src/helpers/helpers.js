import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/firestore'
import { CLOUD_FUNCTION_URLS } from './constants'
import { v4 as generateUniqueId } from 'uuid'

// takes a path to an image in firebase storage and returns the full fetch-able url
export async function getImageFromStorage(path) {
  const ref = firebase.storage().ref()
  return await ref.child(path).getDownloadURL()
}

// takes a phone number as a string, removes all formatting and returns in format (***) ***-****
export function formatPhoneNumber(phoneNumberString) {
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '')
  const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    const intlCode = match[1] ? '+1 ' : ''
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('')
  }
  return null
}

// returns true if a string is a valid URL and false if not
export function isValidURL(str) {
  let url
  try {
    url = new URL(str)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

export function getCollection(name) {
  return firebase.firestore().collection(name)
}

export async function getFirestoreData(identifier) {
  let next = 'doc'
  let query = getCollection(identifier.shift())
  while (identifier.length) {
    if (next === 'doc') {
      query = query.doc(identifier.shift())
      next = 'collection'
    } else {
      query = query.collection(identifier.shift())
      next = 'doc'
    }
  }
  return await query
    .get()
    .then(res =>
      res.data ? res.data() : res.docs ? res.docs.map(doc => doc.data()) : res
    )
}

export async function setFirestoreData(identifier, value) {
  let next = 'doc'
  let query = getCollection(identifier.shift())
  while (identifier.length) {
    if (next === 'doc') {
      query = query.doc(identifier.shift())
      next = 'collection'
    } else {
      query = query.collection(identifier.shift())
      next = 'doc'
    }
  }
  return await query.set(value, { merge: true })
}

export async function updateGoogleCalendarEvent(data) {
  const resource = {
    calendarId: process.env.REACT_APP_GOOGLE_CALENDAR_ID,
    summary: data.driver
      ? `Food Rescue: ${data.driver.name} ${data.driver.phone}`
      : 'Unassigned Food Rescue',
    location: `${data.stops[0].location.address1}, ${data.stops[0].location.city}, ${data.stops[0].location.state} ${data.stops[0].location.zip_code}`,
    description: `Stops on Route: ${data.stops
      .map(
        s =>
          s.org.name +
          `${s.location.name !== s.org.name ? ': ' + s.location.name : ''}` +
          ' (' +
          s.type +
          ')'
      )
      .join(', ')}${data.notes ? `\n\nNotes: ${data.notes}` : ''}`,
    start: {
      dateTime: new Date(data.time_start).toISOString(),
      timeZone: 'America/New_York',
    },
    end: {
      dateTime: new Date(data.time_end).toISOString(),
      timeZone: 'America/New_York',
    },
    attendees: [data.driver ? { email: data.driver.email } : ''],
  }

  if (data.google_calendar_event_id) {
    await fetch(CLOUD_FUNCTION_URLS.deleteCalendarEvent, {
      method: 'POST',
      body: JSON.stringify({
        calendarId: process.env.REACT_APP_GOOGLE_CALENDAR_ID,
        eventId: data.google_calendar_event_id,
      }),
    }).catch(e => console.error('Error deleting original event:', e))
  }

  const event = await fetch(CLOUD_FUNCTION_URLS.addCalendarEvent, {
    method: 'POST',
    body: JSON.stringify(resource),
  })
    .then(res => res.json())
    .catch(e => console.error('Error creating event:', e))

  return event
}

export function generateStopId(stop) {
  return `${stop.org.name}_${generateUniqueId()}`
    .replace(/[^A-Z0-9]/gi, '_')
    .toLowerCase()
}

export const createServerTimestamp = () =>
  firebase.firestore.FieldValue.serverTimestamp()
