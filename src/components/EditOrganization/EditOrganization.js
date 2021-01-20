import React, { useEffect, useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage'
import { Input } from '../Input/Input'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import UserIcon from '../../assets/user.svg'
import { handleOrgIcon, initializeFormData } from './utils'
import './EditOrganization.scss'
import { getCollection } from '../../helpers/helpers'
import validator from 'validator'

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
  const [errors, setErrors] = useState([])
  const [showErrors, setShowErrors] = useState(false)
  const [reloadForm, setReloadForm] = useState(true)

  useEffect(() => {
    if (org.name && !formData.name && reloadForm) {
      initializeFormData(org, setFormData)
      setReloadForm(false)
    }
  }, [org, formData, reloadForm])

  useEffect(() => {
    handleOrgIcon(org.icon, setOrgIconFullUrl)
  }, [org.icon])

  function handleChange(e) {
    setFormData({ ...formData, [e.target.id]: e.target.value })
    setErrors([])
    setShowErrors(false)
  }

  function validateFormData() {
    if (
      !formData.name ||
      !validator.isAlphanumeric(formData.name.split(' ')[0])
    ) {
      errors.push('Missing in form data: Organization Name')
    }
    if (
      !validator.isEmail(formData.default_contact_email) &&
      !!formData.default_contact_email
    ) {
      errors.push('Invalid Data Input: Contact Email is incorrect')
    }
    if (
      !validator.isMobilePhone(formData.default_contact_phone) &&
      !!formData.default_contact_phone.length
    ) {
      errors.push('Invalid Data Input: Contact Phone Number is invalid')
    }
    if (errors.length === 0) {
      return true
    }
    return false
  }
  async function handleSubmit() {
    const is_valid = validateFormData()
    if (is_valid) {
      const org_id = id || (await generateOrgId(formData.name))
      if (org_id) {
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
  }

  async function generateOrgId(name) {
    const uniq_id = name.replace(/[^A-Z0-9]/gi, '_').toLowerCase()
    const exists = await getCollection('Organizations')
      .doc(uniq_id)
      .get()
      .then(res => res.data())
    if (exists) {
      alert(
        'An organization with this name already exists, please use a different name.'
      )
      return null
    } else return uniq_id
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
    if (showErrors === true) {
      return errors.map(error => <p id="FormError">{error}</p>)
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
      <button
        onClick={() => {
          handleSubmit()
          setShowErrors(true)
          setReloadForm(false)
        }}
      >
        {id ? 'update organization' : 'create organization'}
      </button>
    </main>
  )
}
