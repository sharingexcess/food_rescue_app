import { Text } from '@sharingexcess/designsystem'
import { getImageFromStorage, isValidURL, formatPhoneNumber } from 'helpers'

export function handleOrgIcon(icon, callback) {
  if (icon && !isValidURL(icon)) {
    getImageFromStorage(icon).then(url => callback(url))
  }
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
