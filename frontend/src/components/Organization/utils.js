import { Text } from '@sharingexcess/designsystem'
import { formatPhoneNumber } from 'helpers'
import { Emoji } from 'react-apple-emojis'

export function LocationPhone({ loc }) {
  if (loc.contact_phone) {
    return (
      <Text type="small" color="blue">
        <Emoji name="telephone-receiver" width={16} />{' '}
        {formatPhoneNumber(loc.contact_phone)}
      </Text>
    )
  } else return null
}
