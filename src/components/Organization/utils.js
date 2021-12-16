import { ExternalLink, Spacer, Text } from '@sharingexcess/designsystem'
import { getImageFromStorage, isValidURL, formatPhoneNumber } from 'helpers'
import moment from 'moment'
import { formatPhoneNumberIntl } from 'react-phone-number-input'

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
    <Text type="paragraph" color="white" shadow>
      <div>👋</div>
      <Spacer width={8} />
      {org.default_contact_name
        ? `Contact: ${org.default_contact_name}`
        : 'no default contact'}
    </Text>
  )
}

export function OrganizationPhone({ org }) {
  if (org.default_contact_phone) {
    return (
      <Text type="paragraph" color="white" shadow>
        <div>📱</div>
        <Spacer width={8} />
        <ExternalLink to={`tel:${org.default_contact_phone}`}>
          {formatPhoneNumberIntl(org.default_contact_phone)}
        </ExternalLink>
      </Text>
    )
  } else
    return (
      <Text type="paragraph" color="white" shadow>
        <div>📱</div> No phone number available
      </Text>
    )
}

export function LocationPhone({ loc }) {
  if (loc.contact.phone) {
    return (
      <Text type="paragraph" color="blue">
        Contact Phone: {formatPhoneNumber(loc.contact.phone)}
      </Text>
    )
  } else return null
}

export function OrganizationEmail({ org }) {
  if (org.default_contact_email) {
    return (
      <Text type="paragraph" color="white" shadow>
        <div>📧</div>
        <Spacer width={8} />
        <ExternalLink to={`mailto:${org.default_contact_email}`}>
          {org.default_contact_email}
        </ExternalLink>
      </Text>
    )
  } else return null
}

export function OrganizationHours({ org, org_type }) {
  if (org.time_open || org.receive_start) {
    const open_time = moment(org.time_open, 'hh:mm')
    const close_time = moment(org.time_close, 'hh:mm')
    return (
      <p className="org_hours">
        {org.time_open ? (
          <Text type="paragraph" color="grey">
            Hours: {open_time.format('LT')} - {close_time.format('LT')}
            {moment().isBetween(open_time, close_time) ? (
              <span className="open">Open now</span>
            ) : (
              <span className="close">Closed now</span>
            )}
          </Text>
        ) : null}
        {org.receive_start ? (
          <Text type="paragraph" color="grey">
            {org_type === 'recipient' ? 'Receive' : 'Pickup'} hours:{' '}
            {moment(org.receive_start, 'hh:mm').format('LT')} -{' '}
            {moment(org.receive_end, 'hh:mm').format('LT')}
          </Text>
        ) : null}
      </p>
    )
  }
  return null
}
