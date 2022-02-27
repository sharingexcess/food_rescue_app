import moment from 'moment'
import {
  CLOUD_FUNCTION_URLS,
  FOOD_CATEGORIES,
  GOOGLE_MAPS_URL,
} from './constants'
import { setFirestoreData } from './firebase'

export function removeSpecialCharacters(str) {
  return str ? str.replace(/[^A-Z0-9]/gi, '') : ''
}

export function prettyPrintDbFieldName(field_name = '') {
  return field_name.replace('_', ' ')
}

export function shortenLargeNumber(num, digits = 3) {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ]
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value
    })
  return item
    ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol
    : '0'
}

// takes a phone number as a string, removes all formatting and returns in format (***) ***-****
export function formatPhoneNumber(phoneNumberString) {
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '')
  const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    const intlCode = match[1] ? '+1 ' : ''
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]]
      .join('')
      .replace('+1 ', '')
  }
  return null
}

export async function updateGoogleCalendarEvent(data) {
  const resource = {
    calendarId: process.env.REACT_APP_GOOGLE_CALENDAR_ID,
    summary: data.driver
      ? `Food Rescue: ${data.driver.name} ${data.driver.phone}`
      : 'Unassigned Food Rescue',
    location: `${data.stops[0].location.address1}, ${data.stops[0].location.city}, ${data.stops[0].location.state} ${data.stops[0].location.zip}`,
    description: `Stops on Route: ${data.stops
      .map(
        s =>
          `${s.organization.name} (${
            s.location.nickname || s.location.address1
          })`
      )
      .join(', ')}${data.notes ? `\n\nNotes: ${data.notes}` : ''}`,
    start: {
      dateTime: new Date(data.timestamp_scheduled_start).toISOString(),
      timeZone: 'America/New_York',
    },
    end: {
      dateTime: new Date(data.timestamp_scheduled_finish).toISOString(),
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

export const createTimestamp = d => (d ? new Date(d) : new Date())

export const formatTimestamp = (t, format) =>
  moment(t instanceof Date || typeof t === 'string' ? t : t.toDate()).format(
    format
  )

export function generateDirectionsLink(address1, city, state, zip) {
  return `${GOOGLE_MAPS_URL}${address1}+${city}+${state}+${zip}`
}

export async function updateImpactDataForRescue(rescue) {
  return new Promise(async res => {
    const { stops } = rescue

    const current_load = {
      ...FOOD_CATEGORIES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}), // eslint-disable-line
    }
    for (const stop of stops) {
      if (stop.type === 'pickup') {
        for (const category in current_load) {
          current_load[category] += stop[category]
        }
      } else {
        if (stop.percent_of_total_dropped) {
          const impact_data = {}
          const percent_dropped = stop.percent_of_total_dropped / 100
          const load_weight = Object.values(current_load).reduce(
            (a, b) => a + b,
            0
          )
          for (const category in current_load) {
            impact_data[category] = Math.round(
              current_load[category] * percent_dropped
            )
            current_load[category] -= impact_data[category]
          }
          impact_data.impact_data_total_weight = Math.round(
            load_weight * percent_dropped
          )
          await setFirestoreData(['stops', stop.id], {
            ...impact_data,
            timestamp_updated: createTimestamp(),
          })
        }
      }
    }
    res()
  })
}

export function formatLargeNumber(x) {
  if (!x) return 0
  const parts = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (parts[1] && parts[1].length > 2) {
    parts[1] = parts[1].substring(0, 2)
  }
  return parts.join('.')
}
