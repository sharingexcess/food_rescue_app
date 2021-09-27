import React, { useEffect, useState } from 'react'
import { Loading } from 'components'
import { useParams } from 'react-router-dom'
import UserIcon from '../../assets/user.svg'
import {
  UserPronouns,
  UserPhone,
  UserEmail,
  UserAdminPermissions,
  handleUserIcon,
} from './utils'
import { useUserData } from 'hooks'

export function User() {
  // get the user id from the current url parameters
  const { id } = useParams()
  // get that users profile from the users collection in firestore
  const profile = useUserData(id)
  // profileIconFullUrl will be used to store the full path URL to the user's profile photo
  const [profileIconFullUrl, setProfileIconFullUrl] = useState()
  // isAdmin defines whether the user being viewed has admin permissions

  useEffect(() => {
    // handle loading full image url when profile.icon changes
    if (profile && profile.icon) {
      handleUserIcon(profile.icon, setProfileIconFullUrl)
    }
  }, [profile])

  if (!profile) return <Loading text="Loading user" />
  return (
    <main id="User">
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
      <UserAdminPermissions profile={profile} />
    </main>
    // View Driver Document button currently has no functionality
  )
}
