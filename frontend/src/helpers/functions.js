import moment from 'moment'
import { GOOGLE_MAPS_URL } from './constants'

export function removeSpecialCharacters(str) {
  return str ? str.replace(/[^A-Z0-9]/gi, '') : ''
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

export const createTimestamp = d => (d ? new Date(d) : new Date())

export const formatTimestamp = (t, format) =>
  moment(t instanceof Date || typeof t === 'string' ? t : t.toDate()).format(
    format
  )

export function generateDirectionsLink(address1, city, state, zip) {
  return `${GOOGLE_MAPS_URL}${address1}+${city}+${state}+${zip}`
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
