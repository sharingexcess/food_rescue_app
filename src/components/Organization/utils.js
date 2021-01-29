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

export function OrganizationHours({ org, org_type }) {
  if (org.time_open || org.receive_start) {
    const open_time = moment(org.time_open, 'hh:mm')
    const close_time = moment(org.time_close, 'hh:mm')
    return (
      <p className="org_hours">
        {org.time_open ? (
          <p>
            Hours: {open_time.format('LT')} - {close_time.format('LT')}
            {moment().isBetween(open_time, close_time) ? (
              <span className="open">Open now</span>
            ) : (
              <span className="close">Closed now</span>
            )}
          </p>
        ) : null}
        {org.receive_start ? (
          <p>
            {org_type === 'recipient' ? 'Receive' : 'Pickup'} hours:{' '}
            {moment(org.receive_start, 'hh:mm').format('LT')} -{' '}
            {moment(org.receive_end, 'hh:mm').format('LT')}
          </p>
        ) : null}
      </p>
    )
  }
  return <p className="org_hours">Hours: N/A</p>
}
