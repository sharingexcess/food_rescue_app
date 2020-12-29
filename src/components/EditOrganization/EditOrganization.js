import React, { useEffect, useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage'
import { Input } from '../Input/Input'
import { v4 as generateUniqueId } from 'uuid'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import UserIcon from '../../assets/user.svg'
import { handleOrgIcon, initializeFormData } from './utils'
import './EditOrganization.scss'
import { getCollection } from '../../helpers/helpers'

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
  const [org = {}] = useDocumentData(
    id ? getCollection('Organizations').doc(id) : null
  )
  const [orgIconFullUrl, setOrgIconFullUrl] = useState()
  const [file, setFile] = useState()
  const [error, setError] = useState()

  useEffect(() => {
    if (org.name && !formData.name) {
      initializeFormData(org, setFormData)
    }
  }, [org, formData])

  useEffect(() => {
    handleOrgIcon(org.icon, setOrgIconFullUrl)
  }, [org.icon])

  function handleChange(e) {
    setError(false)
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  function validateFormData() {
    if (formData.name.length) {
      return true
    }
    setError(true)
    return false
  }

  async function handleSubmit() {
    const is_valid = validateFormData()
    if (is_valid) {
      const org_id = id || generateUniqueId()
      const icon = await handleFileUpload(org_id)
      getCollection('Organizations')
        .doc(org_id)
        .set(
          { ...formData, id: org_id, icon: icon || org.icon || null },
          { merge: true }
        )
        .then(() => history.push(`/admin/organizations/${org_id}`))
        .catch(e => console.error('Error writing document: ', e))
    }
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

  function FormError() {
    if (error)
      return <p id="FormError">Missing in form data: Organization Name</p>
    else return null
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
          src={file ? URL.createObjectURL(file) : orgIconFullUrl || UserIcon}
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
      <FormError />
      <button onClick={handleSubmit}>
        {id ? 'update organization' : 'create organization'}
      </button>
    </main>
  )
}
