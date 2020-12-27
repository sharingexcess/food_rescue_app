import { ExternalLink } from '../../helpers/components'
import {
  formatPhoneNumber,
  getImageFromStorage,
  isValidURL,
} from '../../helpers/helpers'

export function handleOrgIcon(icon, callback) {
  if (icon && !isValidURL(icon)) {
    getImageFromStorage(icon).then(url => callback(url))
  }
}

export function sortByPrimary(array) {
  return array.sort((x, y) => (x === y ? 0 : x ? 1 : -1))
}

export function OrganizationContact({ org }) {
  return (
    <p>
      <i className="fa fa-user" />
      Contact: {org.default_contact_name || 'no default contact'}
    </p>
  )
}

export function OrganizationPhone({ org }) {
  if (org.phone) {
    return (
      <p>
        <i className="fa fa-phone" />
        <ExternalLink url={`tel:${org.phone}`}>
          {formatPhoneNumber(org.phone)}
        </ExternalLink>
      </p>
    )
  } else
    return (
      <p>
        <i className="fa fa-phone" /> no contact phone
      </p>
    )
}

export function OrganizationEmail({ org }) {
  if (org.email) {
    return (
      <p>
        <i className="fa fa-envelope" />
        <ExternalLink url={`mailto:${org.email}`}>{org.email}</ExternalLink>
      </p>
    )
  } else
    return (
      <p>
        <i className="fa fa-envelope" /> no contact email
      </p>
    )
}
