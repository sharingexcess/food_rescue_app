import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../Auth/Auth'
import { Link } from 'react-router-dom'
import firebase from 'firebase/app'
import Loading from '../Loading/Loading'
import { Input } from '../Input/Input'
import useUserData from '../../hooks/useUserData'
import Header from '../Header/Header'
import './Profile.scss'
import validator from 'validator'
import PhoneInput, { isPossiblePhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

export default function Profile() {
  const { user } = useAuthContext()
  const profile = useUserData(user.uid)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pronouns: '',
  })
  const [button, setButton] = useState()
  const [error, setError] = useState()
  const [driverLicense, setDriverLicense] = useState()
  const [insurance, setInsurance] = useState()

  useEffect(() => {
    // update formData only once by checking name population
    if (!button && !formData.name && profile && profile.name) {
      setFormData({
        name: profile.name,
        phone: profile.phone || '',
        pronouns: profile.pronouns || '',
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
    setFormData({ ...formData, [e.target.id]: e.target.value })
    setButton('update profile')
  }

  function handlePhoneInputChange(changeValue) {
    setFormData(prevData => {
      return { ...prevData, phone: changeValue }
    })
    setButton('update profile')
  }

  function handleUpdate() {
    console.log('Profile >>>', profile)
    if (validateInformation()) {
      firebase
        .firestore()
        .collection('Users')
        .doc(user.uid)
        .set(formData, { merge: true })
        .then(() => {
          setButton('profile updated!')
          setTimeout(() => setButton(), 2000)
          setError()
        })
        .catch(e => console.error('Error updating profile: ', e))
    } else {
      setTimeout(() => setError(), 4000)
    }
  }

  const handleUploadForLicenseAndInsurance = e => {
    if (e.target.id === 'driver-license') {
      console.log('Update driver License')
      setDriverLicense(e.target.files[0])
    } else if (e.target.id === 'insurance') {
      console.log('Update driver Insurance')
      setInsurance(e.target.files[0])
    }
  }
  const PaperWork = ({ type }) => {
    const label = type === 'insurance' ? 'Insurance' : 'Driver License'
    const inputId = type === 'insurance' ? 'insurance' : 'driver-license'
    return (
      <div className="PaperWork">
        <fieldset>
          <legend>{label}</legend>
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadForLicenseAndInsurance}
            id={inputId}
          />
        </fieldset>
      </div>
    )
  }

  return !profile ? (
    <Loading text="Loading profile" />
  ) : (
    <main id="Profile">
      <Header text="Profile" />
      <img src={profile.icon} alt={profile.name} />
      <h3>{profile.email}</h3>
      <button>
        {' '}
        <Link to="/liability">View Signed Document</Link>
      </button>
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

      {button && (
        <button onClick={handleUpdate} disabled={button !== 'update profile'}>
          {button}
        </button>
      )}
      {error && <p id="FormError">{error}</p>}

      <PaperWork type="driver-license" />
      <PaperWork type="insurance" />
    </main>
  )
}
