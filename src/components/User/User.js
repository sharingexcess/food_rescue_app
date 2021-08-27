import React, { memo, useEffect, useState } from 'react'
import Loading from '../Loading/Loading'
import { useParams } from 'react-router-dom'
import UserIcon from '../../assets/user.svg'
import {
  UserPronouns,
  UserPhone,
  UserEmail,
  UserAdminPermissions,
  handleUserIcon,
  checkUserAdminPermissions,
  checkUserBasicAccess,
} from './utils'
import useUserData from '../../hooks/useUserData'
import './User.scss'
import Header from '../Header/Header'

function User() {
  // get the user id from the current url parameters
  const { id } = useParams()
  // get that users profile from the users collection in firestore
  const profile = useUserData(id)
  // profileIconFullUrl will be used to store the full path URL to the user's profile photo
  const [profileIconFullUrl, setProfileIconFullUrl] = useState()
  // isAdmin defines whether the user being viewed has admin permissions
  const [isAdmin, setIsAdmin] = useState()
  const [basicAccess, setBasicAccess] = useState()

  useEffect(() => {
    // check is user is an admin on load
    checkUserAdminPermissions(id, setIsAdmin)
    checkUserBasicAccess(id, setBasicAccess)
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // handle loading full image url when profile.icon changes
    if (profile && profile.icon) {
      handleUserIcon(profile.icon, setProfileIconFullUrl)
    }
  }, [profile])

  if (!profile) return <Loading text="Loading user" />
  return (
    <main id="User">
      <Header text="Manage User" />
      <div>
        <img
          src={profileIconFullUrl || profile.icon || UserIcon}
          id="org-icon"
          alt={profile.name}
        />
        <div>
          <h1>{profile.name}</h1>
          <UserPronouns profile={profile} />
          <UserPhone profile={profile} />
          <UserEmail profile={profile} />
        </div>
      </div>
      <UserAdminPermissions
        id={id}
        email={profile.email}
        isAdmin={isAdmin}
        basicAccess={basicAccess}
      />
    </main>
    // View Driver Document button currently has no functionality
  )
}

export default memo(User)
