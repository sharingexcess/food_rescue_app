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
import { getDriverLicenseFileName, getInsuranceFileName } from './utils'

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
  const [licenseInsuranceButton, setLicenseInsuranceButton] = useState()

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
      setDriverLicense(e.target.files[0])
    } else if (e.target.id === 'insurance') {
      setInsurance(e.target.files[0])
    }
    setLicenseInsuranceButton('update paperwork')
  }
  const handleLicenseAndInsuranceSubmit = async () => {
    const storage = firebase.storage()
    const paperWorkRef = storage.ref().child(`/Users/${user.uid}`)
    const promises = []
    if (driverLicense) {
      promises.push(
        paperWorkRef
          .child(`driverLicense/${driverLicense.name}`)
          .put(driverLicense, { contentType: driverLicense.type })
          .then(snapshot => snapshot.ref.fullPath)
          .then(storagePath => {
            return { driver_license_url: storagePath }
          })
      )
    }
    if (insurance) {
      promises.push(
        paperWorkRef
          .child(`insurance/${insurance.name}`)
          .put(insurance, { contentType: insurance.type })
          .then(snapshot => snapshot.ref.fullPath)
          .then(storagePath => {
            return { insurance_url: storagePath }
          })
      )
    }
    await Promise.all(promises)
      .then(values => {
        const paperWorkData = { driver_license_url: '', insurance_url: '' }
        values.forEach(value => {
          if (value.driver_license_url) {
            paperWorkData.driver_license_url = value.driver_license_url
          } else if (value.insurance_url) {
            paperWorkData.insurance_url = value.insurance_url
          }
        })
        firebase
          .firestore()
          .collection('Users')
          .doc(user.uid)
          .set(paperWorkData, { merge: true })
          .then(() => {
            setLicenseInsuranceButton('paperwork updated!')
            setTimeout(() => setLicenseInsuranceButton(), 3000)
          })
          .catch(e => console.error('Error updating profile: ', e))
      })
      .catch(error => {
        console.error('Error >>>', error)
      })
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

      <div className="PaperWork">
        <fieldset>
          <legend>Driver License</legend>
          <p>
            {profile?.driver_license_url
              ? getDriverLicenseFileName(profile)
              : 'No license selected'}
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadForLicenseAndInsurance}
            id="driver-license"
          />
        </fieldset>
      </div>
      <div className="PaperWork">
        <fieldset>
          <legend>Insurance</legend>
          <p>
            {profile?.insurance_url
              ? getInsuranceFileName(profile)
              : 'No insurance selected'}
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadForLicenseAndInsurance}
            id="insurance"
          />
        </fieldset>
      </div>
      {licenseInsuranceButton && (
        <button
          disabled={licenseInsuranceButton !== 'update paperwork'}
          onClick={handleLicenseAndInsuranceSubmit}
        >
          {licenseInsuranceButton}
        </button>
      )}
    </main>
  )
}
