import React, { useEffect, useState } from 'react'
import { Input, Loading } from 'components'
import { useParams } from 'react-router-dom'
import UserIcon from 'assets/user.svg'
import {
  UserPronouns,
  UserPhone,
  UserEmail,
  UserAdminPermissions,
  handleUserIcon,
  UserDriverAvailability,
} from './utils'
import { useFirestore } from 'hooks'
import { Button, ExternalLink, Spacer, Text } from '@sharingexcess/designsystem'

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

      <Spacer height={32} />
      {profile.driver_liability_release ? (
        <ExternalLink to={profile.driver_liability_release}>
          <Button type="primary" color="white">
            Download Liability Release
          </Button>
        </ExternalLink>
      ) : (
        <Text color="white" shadow>
          This user has not completed a liability release.
        </Text>
      )}

      <Spacer height={32} />
      <Text type="section-header" color="white" shadow>
        Rescue Availability
      </Text>
      <Spacer height={8} />
      <UserDriverAvailability profile={profile} />
      <Input
        element_id="driver_info.make_model"
        label="Vehicle Make + Model"
        value={profile.driver_info.vehicle_make_model}
        readOnly
      />
      <Input
        element_id="driver_info.license_state"
        label="Driver's License State"
        value={profile.driver_info.license_state}
        readOnly
      />
      <Input
        element_id="driver_info.license_number"
        label="Driver's License Number"
        value={profile.driver_info.license_number}
        readOnly
      />
      <Input
        element_id="driver_info.insurance_provider"
        label="Insurance Provider"
        value={profile.driver_info.insurance_provider}
        readOnly
      />
      <Input
        element_id="driver_info.insurance_policy_number"
        label="Insurance Policy Number"
        value={profile.driver_info.insurance_policy_number}
        readOnly
      />
    </main>
    // View Driver Document button currently has no functionality
  )
}
