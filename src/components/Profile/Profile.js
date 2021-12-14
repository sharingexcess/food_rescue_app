import React, { useEffect, useState } from 'react'
import { useAuth, useFirestore } from 'hooks'
import { Input, Loading } from 'components'
import validator from 'validator'
import PhoneInput, { isPossiblePhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { Button, Image, Spacer, Text } from '@sharingexcess/designsystem'
import { setFirestoreData } from 'helpers'
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
    driver_availability: {
      sun_am: false,
      sun_pm: false,
      mon_am: false,
      mon_pm: false,
      tue_am: false,
      tue_pm: false,
      wed_am: false,
      wed_pm: false,
      thu_am: false,
      thu_pm: false,
      fri_am: false,
      fri_pm: false,
      sat_am: false,
      sat_pm: false,
    },
    driver_info: {
      vehicle_make_model: '',
      license_number: '',
      license_state: '',
      insurance_policy_number: '',
      insurance_provider: '',
    },
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
        driver_availability: profile.availability || {
          sun_am: false,
          sun_pm: false,
          mon_am: false,
          mon_pm: false,
          tue_am: false,
          tue_pm: false,
          wed_am: false,
          wed_pm: false,
          thu_am: false,
          thu_pm: false,
          fri_am: false,
          fri_pm: false,
          sat_am: false,
          sat_pm: false,
        },
        driver_info: {
          vehicle_make_model: profile.vehicle_make_model || '',
          license_number: profile.drivers_license_number || '',
          license_state: profile.drivers_license_state || '',
          insurance_policy_number:
            profile.drivers_insurance_policy_number || '',
          insurance_provider: profile.drivers_insurance_provider || '',
        },
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
    } else if (!formData.phone || !isPossiblePhoneNumber(formData.phone)) {
      setError(
        'Your phone may contain invalid characters or missing some digits'
      )
      return false
    }
    return true
  }

  function handleChange(e) {
    if (e.target.id.includes('availability_')) {
      setFormData({
        ...formData,
        driver_availability: {
          ...formData.driver_availability,
          [e.target.id.replace('availability_', '')]: e.target.checked,
        },
      })
    } else {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      })
    }
    setButton('Update Profile')
  }

  function handlePhoneInputChange(changeValue) {
    setFormData(prevData => {
      return { ...prevData, phone: changeValue }
    })
    setButton('Update Profile')
  }

  function handleUpdate() {
    if (validateInformation()) {
      setFirestoreData(['users', user.id], formData)
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
      <PhoneInput
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handlePhoneInputChange}
        defaultCountry="US"
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
            value={formData.driver_availability[i.data_id]}
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
        element_id="drivers_license_state"
        label="Driver's License State"
        value={formData.drivers_license_state}
        onChange={handleChange}
      />
      <Input
        element_id="drivers_license_number"
        label="Driver's License Number"
        value={formData.drivers_license_number}
        onChange={handleChange}
      />
      <Input
        element_id="drivers_insurance_provider"
        label="Insurance Provider"
        value={formData.drivers_insurance_provider}
        onChange={handleChange}
      />
      <Input
        element_id="drivers_insurance_policy_number"
        label="Insurance Policy Number"
        value={formData.drivers_insurance_policy_number}
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
