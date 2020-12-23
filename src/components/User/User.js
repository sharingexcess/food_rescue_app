import React, { memo, useContext, useEffect, useState } from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import firebase from 'firebase/app'
import Loading from '../Loading/Loading'
import { Link, useParams } from 'react-router-dom'
import UserIcon from '../../assets/user.svg'
import {
  formatPhoneNumber,
  getImageFromStorage,
  isValidURL,
} from '../../helpers/helpers'
import { CLOUD_FUNCTION_URLS } from '../../helpers/constants'
import { AuthContext } from '../Auth/Auth'
import './User.scss'

function User() {
  const { id } = useParams()
  const { user: current_auth_user } = useContext(AuthContext)
  const [user = {}, loading] = useDocumentData(
    firebase.firestore().collection('Users').doc(id)
  )
  const [userIcon, setUserIcon] = useState()
  const [isAdmin, setIsAdmin] = useState()

  useEffect(() => fetchIsAdmin(), []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function updateImageSrc(user) {
      const image = await getImageFromStorage(user.icon)
      setUserIcon(image)
    }
    user.icon && !isValidURL(user.icon) && updateImageSrc(user)
  }, [user])

  async function fetchIsAdmin() {
    const url = `${CLOUD_FUNCTION_URLS.isUserAdmin}?id=${id}`
    const res = await fetch(url).then(res => res.text())
    setIsAdmin(res === 'true' ? true : false)
  }

  async function updateIsAdmin(newIsAdmin) {
    const url = `${CLOUD_FUNCTION_URLS.setUserAdmin}?id=${id}&admin=${newIsAdmin}`
    try {
      fetch(url, { method: 'POST' })
        .then(res => res.text())
        .then(() => window.location.reload())
    } catch (e) {
      console.error(e)
    }
  }

  return loading ? (
    <Loading text="Loading user" />
  ) : (
    <main id="User">
      <Link className="back" to="/admin/users">
        {'< '} back to users
      </Link>
      <div>
        <img
          src={userIcon || user.icon || UserIcon}
          id="org-icon"
          alt={user.name}
        />
        <div>
          <h1>{user.name}</h1>
          <p>
            <i className="fa fa-user" />
            {user.pronouns || 'no listed pronouns'}
          </p>
          <p>
            <a
              href={`tel:${user.phone}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa fa-phone" />
              {formatPhoneNumber(user.phone) || 'no contact phone'}
            </a>
          </p>
          <p>
            <a
              href={`mailto:${user.email}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa fa-envelope" />
              {user.email || 'no contact email'}
            </a>
          </p>
        </div>
      </div>
      {current_auth_user.uid === id ? (
        <p id="isAdmin">You are currently logged in as this user.</p>
      ) : (
        <>
          <p id="isAdmin">
            {isAdmin
              ? 'This user has admin access'
              : 'This user does not have admin access.'}
          </p>
          {isAdmin ? (
            <button className="revoke" onClick={() => updateIsAdmin(false)}>
              Revoke Admin Access
            </button>
          ) : (
            <button className="grant" onClick={() => updateIsAdmin(true)}>
              Grant Admin Access
            </button>
          )}
        </>
      )}
    </main>
  )
}

export default memo(User)
