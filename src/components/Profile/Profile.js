import React, { useEffect, useState } from 'react'
import { useAuth, useFirestore } from 'hooks'
import { Input, Loading } from 'components'
import validator from 'validator'
import { Button, Image, Spacer, Text } from '@sharingexcess/designsystem'
import { createTimestamp, setFirestoreData } from 'helpers'
import { availability } from './utils'
import { useHistory } from 'react-router'

export function Profile() {
  const { user } = useAuth()
  const history = useHistory()
  const profile = useFirestore('users', user ? user.uid : null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pronouns: '',
    available_sun_am: false,
    available_sun_pm: false,
    available_mon_am: false,
    available_mon_pm: false,
    available_tue_am: false,
    available_tue_pm: false,
    available_wed_am: false,
    available_wed_pm: false,
    available_thu_am: false,
    available_thu_pm: false,
    available_fri_am: false,
    available_fri_pm: false,
    available_sat_am: false,
    available_sat_pm: false,
    vehicle_make_model: '',
    license_number: '',
    license_state: '',
    insurance_policy_number: '',
    insurance_provider: '',
  })
  const [button, setButton] = useState()
  const [error, setError] = useState()

  useEffect(() => {
    // update formData only once by checking name population
    if (!button && !formData.name && profile && profile.name) {
      setFormData({
        name: profile.name,
        phone: profile.phone || '',
        pronouns: profile.pronouns || '',
        available_sun_am: false,
        available_sun_pm: false,
        available_mon_am: false,
        available_mon_pm: false,
        available_tue_am: false,
        available_tue_pm: false,
        available_wed_am: false,
        available_wed_pm: false,
        available_thu_am: false,
        available_thu_pm: false,
        available_fri_am: false,
        available_fri_pm: false,
        available_sat_am: false,
        available_sat_pm: false,
        vehicle_make_model: profile.vehicle_make_model || '',
        license_number: profile.license_number || '',
        license_state: profile.license_state || '',
        insurance_policy_number: profile.insurance_policy_number || '',
        insurance_provider: profile.insurance_provider || '',
      })
    }
  }, [profile, formData, button])

  function validateInformation() {
    if (
      !formData.name ||
      !validator.isAlphanumeric(formData.name.split(' ')[0])
    ) {
      setError("Please enter your Profile's Name")
      return false
    } else if (!formData.phone) {
      setError(
        'Your phone may contain invalid characters or missing some digits'
      )
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
          history.push('/')
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
            onChange={handleChange}
          />
        ))}
      </div>
      <Input
        element_id="vehicle_make_model"
        label="Vehicle Make + Model"
        value={formData.vehicle_make_model}
        onChange={handleChange}
      />
      <Input
        element_id="license_state"
        label="Driver's License State"
        value={formData.license_state}
        onChange={handleChange}
      />
      <Input
        element_id="license_number"
        label="Driver's License Number"
        value={formData.license_number}
        onChange={handleChange}
      />
      <Input
        element_id="insurance_provider"
        label="Insurance Provider"
        value={formData.insurance_provider}
        onChange={handleChange}
      />
      <Input
        element_id="insurance_policy_number"
        label="Insurance Policy Number"
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
