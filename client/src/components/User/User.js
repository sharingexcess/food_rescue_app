import React from 'react'
import { Input, Loading } from 'components'
import { useParams } from 'react-router-dom'
import UserIcon from 'assets/user.svg'
import {
  UserPronouns,
  UserPhone,
  UserEmail,
  UserAdminPermissions,
  UserDriverAvailability,
} from './utils'
import { useFirestore } from 'hooks'
import { Spacer, Text } from '@sharingexcess/designsystem'

export function User() {
  // get the user id from the current url parameters
  const { id } = useParams()
  // get that users profile from the users collection in firestore
  const profile = useFirestore('users', id)
  // profileIconFullUrl will be used to store the full path URL to the user's profile photo

  if (!profile) return <Loading text="Loading user" />
  return (
    <main id="User">
      <img src={profile.icon || UserIcon} id="org-icon" alt={profile.name} />
      <Spacer height={24} />
      <div id="User-info">
        <Text type="secondary-header" color="white" align="center" shadow>
          {profile.name}
        </Text>
        <Spacer height={4} />
        <UserEmail profile={profile} />
        <Spacer height={4} />
        <UserPronouns profile={profile} />
        <Spacer height={4} />
        <UserPhone profile={profile} />
      </div>
      <Spacer height={32} />
      <UserAdminPermissions profile={profile} />

      <Spacer height={32} />
      {profile.completed_liability_release ? (
        <Text color="white" type="small" shadow align="center">
          This user has signed the liability release form.
        </Text>
      ) : (
        <Text color="white" type="small" shadow align="center">
          This user has not completed a liability release.
        </Text>
      )}

      <Spacer height={32} />
      <Text type="section-header" color="white" shadow>
        Rescue Availability
      </Text>
      <Spacer height={8} />
      <UserDriverAvailability profile={profile} />
      <Spacer height={24} />
      <Input
        element_id="vehicle_make_model"
        label="Vehicle Make + Model"
        value={profile.vehicle_make_model}
        readOnly
      />
      <Input
        element_id="license_state"
        label="Driver's License State"
        value={profile.license_state}
        readOnly
      />
      <Input
        element_id="license_number"
        label="Driver's License Number"
        value={profile.license_number}
        readOnly
      />
      <Input
        element_id="insurance_provider"
        label="Insurance Provider"
        value={profile.insurance_provider}
        readOnly
      />
      <Input
        element_id="insurance_policy_number"
        label="Insurance Policy Number"
        value={profile.insurance_policy_number}
        readOnly
      />
    </main>
    // View Driver Document button currently has no functionality
  )
}
