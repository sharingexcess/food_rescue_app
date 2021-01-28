import { getImageFromStorage, isValidURL } from '../../helpers/helpers'

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
    time_open: org.time_open,
    time_close: org.time_close,
  })
}
