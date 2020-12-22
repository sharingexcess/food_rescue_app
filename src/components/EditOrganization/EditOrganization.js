import React, { useEffect, useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { Input } from '../Input/Input'
import { v4 as generateUniqueId } from 'uuid'
import './EditOrganization.scss'
import { useDocumentData } from 'react-firebase-hooks/firestore'

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

  function handleChange(e) {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  function handleSubmit() {
    const new_id = id || generateUniqueId()
    firebase
      .firestore()
      .collection('Organizations')
      .doc(new_id)
      .set({ ...formData, new_id }, { merge: true })
      .then(() => history.push(`/admin/organizations/${id}`))
      .catch(e => console.error('Error writing document: ', e))
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
