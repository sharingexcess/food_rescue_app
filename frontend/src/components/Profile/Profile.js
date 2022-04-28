import React, { useEffect, useState } from 'react'
import { useAuth, useFirestore } from 'hooks'
import { Input, Loading } from 'components'
import { Button, Image, Spacer, Text } from '@sharingexcess/designsystem'
import {
  createTimestamp,
  getCollection,
  removeSpecialCharacters,
  setFirestoreData,
} from 'helpers'
import { availability } from './utils'
import { useNavigate } from 'react-router'

export function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  // profile looks up the user in the firestore db
  // to get additional permissions and profile data
  const [profile, setProfile] = useState()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pronouns: '',
    availability_sun_am: false,
    availability_sun_pm: false,
    availability_mon_am: false,
    availability_mon_pm: false,
    availability_tue_am: false,
    availability_tue_pm: false,
    availability_wed_am: false,
    availability_wed_pm: false,
    availability_thu_am: false,
    availability_thu_pm: false,
    availability_fri_am: false,
    availability_fri_pm: false,
    availability_sat_am: false,
    availability_sat_pm: false,
    vehicle_make_model: '',
    license_number: '',
    license_state: '',
    insurance_policy_number: '',
    insurance_provider: '',
  })
  const [button, setButton] = useState()
  const [error, setError] = useState()

  useEffect(() => {
    const uid = user ? user.uid : null
    let unsubscribe
    if (uid) {
      const userRef = getCollection('users').doc(uid)
      unsubscribe = userRef.onSnapshot(doc => setProfile(doc.data()))
    }
    return () => unsubscribe && unsubscribe()
  }, [user])

  useEffect(() => {
    // update formData only once by checking name population
    if (!button && !formData.name && profile && profile.name) {
      setFormData({
        name: profile.name,
        phone: removeSpecialCharacters(profile.phone || ''),
        pronouns: profile.pronouns || '',
        availability_sun_am: profile.availability_sun_am,
        availability_sun_pm: profile.availability_sun_pm,
        availability_mon_am: profile.availability_mon_am,
        availability_mon_pm: profile.availability_mon_pm,
        availability_tue_am: profile.availability_tue_am,
        availability_tue_pm: profile.availability_tue_pm,
        availability_wed_am: profile.availability_wed_am,
        availability_wed_pm: profile.availability_wed_pm,
        availability_thu_am: profile.availability_thu_am,
        availability_thu_pm: profile.availability_thu_pm,
        availability_fri_am: profile.availability_fri_am,
        availability_fri_pm: profile.availability_fri_pm,
        availability_sat_am: profile.availability_sat_am,
        availability_sat_pm: profile.availability_sat_pm,
        vehicle_make_model: profile.vehicle_make_model || '',
        license_number: profile.license_number || '',
        license_state: profile.license_state || '',
        insurance_policy_number: profile.insurance_policy_number || '',
        insurance_provider: profile.insurance_provider || '',
      })
    }
  }, [profile, formData, button])

  function validateInformation() {
    if (!formData.name) {
      window.alert("Don't forget to enter your name!")
      return false
      // } else if (!formData.phone) {
      //   window.alert("Don't forget to enter your phone number!")
      //   return false
      // }
    } else if (!formData.pronouns) {
      window.alert("Don't forget to let us know your preferred pronouns!")
      return false
    }
    return true
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
    setButton('Update Profile')
  }

  function handleUpdate() {
    if (validateInformation()) {
      setFirestoreData(['users', user.id], {
        ...formData,
        timestamp_updated: createTimestamp(),
      })
        .then(() => {
          setButton('profile updated!')
          setTimeout(() => setButton(), 2000)
          setError()
          navigate('/')
        })
        .catch(e => console.error('Error updating profile: ', e))
    }
  }

  return !profile ? (
    <Loading text="Loading profile" />
  ) : (
    <main id="Profile">
      <Image src={profile.icon} alt={profile.name} shadow />
      <Text
        type="section-header"
        color="white"
        shadow
        align="center"
        wrap={false}
      >
        {profile.name}
      </Text>
      <Text type="small" color="white" shadow align="center" wrap={false}>
        {profile.email}
      </Text>
      <Input
        element_id="name"
        label="Display Name"
        value={formData.name}
        onChange={handleChange}
      />
      <Input
        element_id="pronouns"
        label="Personal Pronouns"
        value={formData.pronouns}
        onChange={handleChange}
      />
      <Input
        element_id="phone"
        label="Phone Number"
        value={formData.phone}
        onChange={handleChange}
      />
      <Spacer height={16} />
      <Text type="section-header" color="white" shadow>
        Rescue Availability
      </Text>
      <Spacer height={8} />
      <div id="Profile-driver-availability">
        {availability.map(i => (
          <Input
            key={i.label}
            element_id={i.element_id}
            label={i.label}
            type="checkbox"
            value={formData[i.element_id]}
            onChange={e => {
              setFormData({
                ...formData,
                [e.target.id]: e.target.checked,
              })
              setButton('Update Profile')
            }}
          />
        ))}
      </div>
      <Input
        element_id="vehicle_make_model"
        label="Vehicle Make + Model (only for drivers)"
        value={formData.vehicle_make_model}
        onChange={handleChange}
      />
      <Input
        element_id="license_state"
        label="Driver's License State (only for drivers)"
        value={formData.license_state}
        onChange={handleChange}
      />
      <Input
        element_id="license_number"
        label="Driver's License Number (only for drivers)"
        value={formData.license_number}
        onChange={handleChange}
      />
      <Input
        element_id="insurance_provider"
        label="Insurance Provider (only for drivers)"
        value={formData.insurance_provider}
        onChange={handleChange}
      />
      <Input
        element_id="insurance_policy_number"
        label="Insurance Policy Number (only for drivers)"
        value={formData.insurance_policy_number}
        onChange={handleChange}
      />
      {button && (
        <Button
          color="blue"
          size="large"
          handler={handleUpdate}
          disabled={button !== 'Update Profile'}
          fullWidth
        >
          {button}
        </Button>
      )}
      {error && <p id="FormError">{error}</p>}
    </main>
  )
}
