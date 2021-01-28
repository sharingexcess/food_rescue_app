import { ExternalLink } from '../../helpers/components'
import {
  formatPhoneNumber,
  getImageFromStorage,
  isValidURL,
} from '../../helpers/helpers'
import moment from 'moment'

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
      {org.default_contact_name
        ? `Contact: ${org.default_contact_name}`
        : 'no default contact'}
    </p>
  )
}

export function OrganizationPhone({ org }) {
  if (org.default_contact_phone) {
    return (
      <p>
        <i className="fa fa-phone" />
        <ExternalLink url={`tel:${org.default_contact_phone}`}>
          {formatPhoneNumber(org.default_contact_phone)}
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
  if (org.default_contact_email) {
    return (
      <p>
        <i className="fa fa-envelope" />
        <ExternalLink url={`mailto:${org.default_contact_email}`}>
          {org.default_contact_email}
        </ExternalLink>
      </p>
    )
  } else
    return (
      <p>
        <i className="fa fa-envelope" /> no contact email
      </p>
    )
}

export function OrganizationHours({ org }) {
  if (org.time_open) {
    return (
      <p>
        <i className="fa fa-clock-o" /> Operation hours: {org.time_open} -{' '}
        {org.time_close}
        {moment().isBetween(
          moment(org.time_open, 'hh:mm'),
          moment(org.time_close, 'hh:mm')
        ) ? (
          <span className="open">Open Now</span>
        ) : (
          <span className="close">Closed Now</span>
        )}
        {org.org_type === 'recipient' ? (
          org.receive_start ? (
            <p>
              Receive interval: {org.receive_start} - {org.receive_end}
            </p>
          ) : null
        ) : null}
      </p>
    )
  }
  return (
    <p>
      <i className="fa fa-clock-o" /> no operation hours
    </p>
  )
}
