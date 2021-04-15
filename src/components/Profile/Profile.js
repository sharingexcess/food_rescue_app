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
import PaperWorkForm from '../PaperWorkForm/PaperWorkForm'

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
  const [isOpenPaperWork, setIsOpenPaperWork] = useState(false)

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
      <button
        className={`openForm ${isOpenPaperWork ? 'paperwork' : 'basic'}`}
        onClick={() => setIsOpenPaperWork(!isOpenPaperWork)}
      >
        {isOpenPaperWork && (
          <i className="fa fa-arrow-left" style={{ background: 'none' }}></i>
        )}
        {isOpenPaperWork ? 'Basic Info' : 'Documents'}
        {!isOpenPaperWork && (
          <i className="fa fa-arrow-right" style={{ background: 'none' }}></i>
        )}
      </button>
      {!isOpenPaperWork ? (
        <div>
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
            <button
              onClick={handleUpdate}
              disabled={button !== 'update profile'}
            >
              {button}
            </button>
          )}
          {error && <p id="FormError">{error}</p>}
        </div>
      ) : (
        <PaperWorkForm profile={profile} user={user} />
      )}
    </main>
  )
}
