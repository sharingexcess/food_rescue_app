import { getImageFromStorage, isValidURL } from 'helpers'
import { v4 as generateUUID } from 'uuid'

export function handleOrgIcon(icon, callback) {
  if (icon && !isValidURL(icon)) {
    getImageFromStorage(icon).then(url => callback(url))
  }
}

export function initializeFormData(org, callback) {
  callback({
    name: org.name,
    default_contact_name: org.default_contact_name,
    default_contact_email: org.default_contact_email,
    default_contact_phone: org.default_contact_phone,
    org_type: org.org_type,
  })
}

export function generateDirectDonationId(name) {
  return `${name}_${generateUUID()}`.replace(/[^A-Z0-9]/gi, '_').toLowerCase()
}
