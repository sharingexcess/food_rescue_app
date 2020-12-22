import React, { useEffect, useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage'
import { Input } from '../Input/Input'
import { v4 as generateUniqueId } from 'uuid'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import UserIcon from '../../assets/user.svg'
import './EditOrganization.scss'
import { getImageFromStorage } from '../../helpers/helpers'

export default function EditOrganization() {
  const { id } = useParams()
  const history = useHistory()
  const [formData, setFormData] = useState({
    name: '',
    default_contact_name: '',
    default_contact_email: '',
    default_contact_phone: '',
    org_type: 'donor',
  })
  const [file, setFile] = useState()
  const [orgIcon, setOrgIcon] = useState()
  const [org = {}] = useDocumentData(
    id ? firebase.firestore().collection('Organizations').doc(id) : null
  )

  useEffect(() => {
    if (org.name && !formData.name) {
      setFormData({
        name: org.name,
        default_contact_name: org.default_contact_name,
        default_contact_email: org.default_contact_email,
        default_contact_phone: org.default_contact_phone,
        org_type: org.org_type,
      })
    }
  }, [org, formData])

  useEffect(() => {
    org.icon && getImageFromStorage(org.icon).then(image => setOrgIcon(image))
  }, [org.icon])

  function handleChange(e) {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  async function handleSubmit() {
    const org_id = id || generateUniqueId()
    const icon = await handleFileUpload(org_id)
    firebase
      .firestore()
      .collection('Organizations')
      .doc(org_id)
      .set({ ...formData, id: org_id, icon: icon || org.icon }, { merge: true })
      .then(() => history.push(`/admin/organizations/${id}`))
      .catch(e => console.error('Error writing document: ', e))
  }

  function handleFileChange(e) {
    setFile(e.target.files[0])
  }

  async function handleFileUpload(org_id = id) {
    if (file) {
      const ref = firebase.storage().ref()
      const path = `/Organizations/${org_id}/assets/${file.name}`
      await ref.child(path).put(file, { contentType: file.type })
      return path
    } else return null
  }

  return (
    <main id="EditOrganization">
      <Link
        className="back"
        to={id ? `/admin/organizations/${id}` : `/admin/organizations`}
      >
        {'< '} back
      </Link>
      <h1>{id ? 'Edit Organization' : 'Create Organization'}</h1>
      <section>
        <img
          src={file ? URL.createObjectURL(file) : orgIcon || UserIcon}
          alt="org_icon"
        />
        <input type="file" onChange={handleFileChange} accept="image/*" />
      </section>
      <Input
        type="text"
        label="Organization Name"
        element_id="name"
        value={formData.name}
        onChange={handleChange}
      />
      <Input
        type="text"
        label="Contact Name"
        element_id="default_contact_name"
        value={formData.default_contact_name}
        onChange={handleChange}
      />
      <Input
        type="email"
        label="Contact Email"
        element_id="default_contact_email"
        value={formData.default_contact_email}
        onChange={handleChange}
      />
      <Input
        type="tel"
        label="Contact Phone"
        element_id="default_contact_phone"
        value={formData.default_contact_phone}
        onChange={handleChange}
      />
      <Input
        type="select"
        label="Organization Type"
        element_id="org_type"
        value={formData.org_type}
        suggestions={['donor', 'recipient']}
        onSuggestionClick={handleChange}
      />
      <button onClick={handleSubmit}>
        {id ? 'update organization' : 'create organization'}
      </button>
    </main>
  )
}
