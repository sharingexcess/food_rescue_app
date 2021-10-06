import React, { useEffect, useState } from 'react'
import { Loading } from 'components'
import { useParams } from 'react-router-dom'
import UserIcon from 'assets/user.svg'
import {
  UserPronouns,
  UserPhone,
  UserEmail,
  UserAdminPermissions,
  handleUserIcon,
} from './utils'
import { useFirestore } from 'hooks'
import { Spacer, Text } from '@sharingexcess/designsystem'

export function User() {
  // get the user id from the current url parameters
  const { id } = useParams()
  // get that users profile from the users collection in firestore
  const profile = useFirestore('users', id)
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
      <img
        src={profileIconFullUrl || profile.icon || UserIcon}
        id="org-icon"
        alt={profile.name}
      />
      <Spacer height={24} />
      <div id="User-info">
        <Text type="secondary-header" color="white" align="center" shadow>
          {profile.name}
        </Text>
        <Spacer height={16} />
        <UserPronouns profile={profile} />
        <Spacer height={4} />
        <UserPhone profile={profile} />
        <Spacer height={4} />
        <UserEmail profile={profile} />
      </div>
      <Spacer height={32} />
      <UserAdminPermissions profile={profile} />
    </main>
    // View Driver Document button currently has no functionality
  )
}
