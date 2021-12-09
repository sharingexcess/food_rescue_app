import { ExternalLink, Spacer, Text } from '@sharingexcess/designsystem'
import {
  createTimestamp,
  getImageFromStorage,
  isValidURL,
  setFirestoreData,
} from 'helpers'
import { useAuth } from 'hooks'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { useEffect, useState } from 'react'
import { availability } from 'components/Profile/utils'
import { Input } from 'components'

export function handleUserIcon(icon, callback) {
  if (icon && !isValidURL(icon)) {
    getImageFromStorage(icon).then(url => callback(url))
  }
}

export function UserPronouns({ profile }) {
  return (
    <Text
      id="User-pronouns"
      type="paragraph"
      color="white"
      align="center"
      shadow
    >
      <div>👋</div>
      <Spacer width={8} />
      {profile.pronouns || 'no listed pronouns'}
    </Text>
  )
}

export function UserPhone({ profile }) {
  if (profile.phone) {
    return (
      <Text
        id="User-phone"
        type="paragraph"
        color="white"
        align="center"
        shadow
      >
        <div>📱</div>
        <Spacer width={8} />
        <ExternalLink to={`tel:${profile.phone}`}>
          {formatPhoneNumberIntl(profile.phone)}
        </ExternalLink>
      </Text>
    )
  } else
    return (
      <Text
        id="User-phone"
        type="paragraph"
        color="white"
        align="center"
        shadow
      >
        <div>📱</div>
        <Spacer width={8} />
        no contact phone
      </Text>
    )
}

export function UserEmail({ profile }) {
  if (profile.email) {
    return (
      <Text
        id="User-phone"
        type="paragraph"
        color="white"
        align="center"
        shadow
      >
        <div>📧</div>
        <Spacer width={8} />
        <ExternalLink to={`mailto:${profile.email}`}>
          {profile.email}
        </ExternalLink>
      </Text>
    )
  } else
    return (
      <Text
        id="User-phone"
        type="paragraph"
        color="white"
        align="center"
        shadow
      >
        <div>📧</div>
        <Spacer width={8} />
        no contact email
      </Text>
    )
}

export function UserAdminPermissions({ profile }) {
  const { user } = useAuth()
  const [accessLevel, setAccessLevel] = useState(profile.access_level)

  useEffect(() => {
    if (accessLevel !== profile.access_level) {
      setFirestoreData(['Users', profile.id], {
        access_level: accessLevel,
        updated_at: createTimestamp(),
        granted_access_by: user.name,
      })
    }
  }, [accessLevel]) // eslint-disable-line

  if (user.uid === profile.id) {
    return (
      <Text color="white" id="isAdmin">
        You are currently logged in as this user.
      </Text>
    )
  } else
    return (
      <div id="AccessLevel">
        <Text type="section-header" color="white" shadow>
          Access Level
        </Text>
        <Spacer height={8} />
        <select
          value={accessLevel}
          onChange={e => setAccessLevel(e.target.value)}
        >
          <option value="none">No Access</option>
          <option value="driver">Driver Access</option>
          <option value="admin">Admin Access</option>
        </select>
      </div>
    )
}

export function UserDriverAvailability({ profile }) {
  return profile.driver_availability ? (
    <div id="User-driver-availability">
      {availability.map(i => (
        <Input
          key={i.label}
          element_id={i.element_id}
          label={i.label}
          type="checkbox"
          value={profile.driver_availability[i.data_id]}
        />
      ))}
    </div>
  ) : (
    <Text color="white" shadow>
      This user has not filled out their availability.
    </Text>
  )
}
