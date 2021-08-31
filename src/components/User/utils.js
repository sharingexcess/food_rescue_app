import Ellipsis, { ExternalLink } from '../../helpers/components'
import {
  createServerTimestamp,
  getImageFromStorage,
  isValidURL,
  setFirestoreData,
} from '../../helpers/helpers'
import { useAuth } from '../Auth/Auth'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { useEffect, useState } from 'react'

export function handleUserIcon(icon, callback) {
  if (icon && !isValidURL(icon)) {
    getImageFromStorage(icon).then(url => callback(url))
  }
}

export function UserPronouns({ profile }) {
  return (
    <p>
      <i className="fa fa-user" />
      {profile.pronouns || 'no listed pronouns'}
    </p>
  )
}

export function UserPhone({ profile }) {
  if (profile.phone) {
    return (
      <p>
        <i className="fa fa-phone" />
        <ExternalLink url={`tel:${profile.phone}`}>
          {formatPhoneNumberIntl(profile.phone)}
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

export function UserEmail({ profile }) {
  if (profile.email) {
    return (
      <p>
        <i className="fa fa-envelope" />
        <ExternalLink url={`mailto:${profile.email}`}>
          {profile.email}
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

export function UserAdminPermissions({ profile }) {
  const { user } = useAuth()
  const [accessLevel, setAccessLevel] = useState(profile.access_level)

  useEffect(() => {
    if (accessLevel !== profile.access_level) {
      setFirestoreData(['Users', profile.id], {
        access_level: accessLevel,
        updated_at: createServerTimestamp(),
        granted_access_by: user.name,
      })
    }
  }, [accessLevel]) // eslint-disable-line

  if (user.uid === profile.id) {
    return <p id="isAdmin">You are currently logged in as this user.</p>
  } else
    return (
      <div id="AccessLevel">
        <h3>Access Level</h3>
        <select
          value={accessLevel}
          onChange={e => setAccessLevel(e.target.value)}
        >
          <option value="none">No Access</option>
          <option value="basic">Driver Access</option>
          <option value="admin">Admin Access</option>
        </select>
      </div>
    )
}
