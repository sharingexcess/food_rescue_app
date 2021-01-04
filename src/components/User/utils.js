import Ellipsis, { ExternalLink } from '../../helpers/components'
import { CLOUD_FUNCTION_URLS } from '../../helpers/constants'
import {
  formatPhoneNumber,
  getImageFromStorage,
  isValidURL,
} from '../../helpers/helpers'
import { useAuthContext } from '../Auth/Auth'

export function handleUserIcon(icon, callback) {
  if (icon && !isValidURL(icon)) {
    getImageFromStorage(icon).then(url => callback(url))
  }
}

export async function checkUserAdminPermissions(id, callback) {
  const check_admin_url = `${CLOUD_FUNCTION_URLS.isUserAdmin}?id=${id}`
  const response = await fetch(check_admin_url).then(data => data.text())
  callback(response === 'true' ? true : false)
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
          {formatPhoneNumber(profile.phone)}
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

export function UserAdminPermissions({ id, isAdmin }) {
  const { user } = useAuthContext()

  async function updateIsAdmin(newIsAdmin) {
    const url = `${CLOUD_FUNCTION_URLS.setUserAdmin}?id=${id}&admin=${newIsAdmin}`
    try {
      fetch(url, { method: 'POST' }).then(() => window.location.reload())
    } catch (e) {
      console.error(e)
    }
  }

  if (user.uid === id) {
    return <p id="isAdmin">You are currently logged in as this user.</p>
  } else if (isAdmin === undefined) {
    // handle if we haven't received a response on if this user is admin
    return (
      <p id="isAdmin">
        Checking admin permission status
        <Ellipsis />
      </p>
    )
  } else if (isAdmin) {
    return (
      <>
        <p id="isAdmin">This user has admin access.</p>
        <button className="revoke" onClick={() => updateIsAdmin(false)}>
          Revoke Admin Access
        </button>
      </>
    )
  } else
    return (
      <>
        <p id="isAdmin">This user does not have admin access.</p>
        <button className="grant" onClick={() => updateIsAdmin(true)}>
          Grant Admin Access
        </button>
      </>
    )
}
