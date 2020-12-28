import React, { useEffect, useState } from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { useAuthContext } from '../Auth/Auth'
import firebase from 'firebase/app'
import './Profile.scss'
import Loading from '../Loading/Loading'
import { Input } from '../Input/Input'
import { Link } from 'react-router-dom'

export default function Profile() {
  const { user } = useAuthContext()
  const [profile = {}, loading] = useDocumentData(
    firebase.firestore().collection('Users').doc(user.uid)
  )
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pronouns: '',
  })
  const [button, setButton] = useState()

  useEffect(() => {
    // update formData only once by checking name population
    if (!button && !formData.name && profile.name) {
      setFormData({
        name: profile.name,
        phone: profile.phone || '',
        pronouns: profile.pronouns || '',
      })
    }
  }, [profile, formData, button])

  function handleChange(e) {
    setFormData({ ...formData, [e.target.id]: e.target.value })
    setButton('update profile')
  }

  function handleUpdate() {
    firebase
      .firestore()
      .collection('Users')
      .doc(user.uid)
      .set(formData, { merge: true })
      .then(() => {
        setButton('profile updated!')
        setTimeout(() => setButton(), 2000)
      })
      .catch(e => console.error('Error updating profile: ', e))
  }

  return loading ? (
    <Loading text="Loading profile" />
  ) : (
    <main id="Profile">
      <Link className="back" to="/">
        {'< '} back to home
      </Link>
      <h1>User Profile</h1>
      <img src={profile.icon} alt={profile.name} />
      <h3>{profile.email}</h3>
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
      {button && <button onClick={handleUpdate}>{button}</button>}
    </main>
  )
}
