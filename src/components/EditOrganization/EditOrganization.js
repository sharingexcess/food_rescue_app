import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  createTimestamp,
  DONOR_TYPES,
  generateUniqueId,
  getCollection,
  ORG_TYPES,
  RECIPIENT_TYPES,
  setFirestoreData,
} from 'helpers'
import { Input } from 'components'
import { useFirestore } from 'hooks'
import { Button } from '@sharingexcess/designsystem'

export function EditOrganization() {
  const { organization_id } = useParams()
  const history = useHistory()
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    subtype: '',
  })
  const org = useFirestore('organizations', organization_id)
  const locations = useFirestore('locations')
  const [errors, setErrors] = useState([])
  const [showErrors, setShowErrors] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    if (org && org.name && !formData.name && isInitialLoad) {
      setIsInitialLoad(false)
      setFormData(formData => ({ ...formData, ...org }))
    }
  }, [org, formData, isInitialLoad])

  function handleChange(e) {
    setFormData({ ...formData, [e.target.id]: e.target.value })
    setErrors([])
    setShowErrors(false)
  }

  function validateFormData() {
    if (!formData.name) {
      errors.push('Missing in form data: Organization Name')
    }
    if (errors.length === 0) {
      return true
    }
    return false
  }

  async function handleSubmit() {
    if (validateFormData()) {
      try {
        const org_id =
          organization_id || (await generateUniqueId('organizations'))
        await setFirestoreData(['organizations', org_id], {
          id: org_id,
          name: formData.name,
          type: formData.type,
          subtype: formData.subtype,
          timestamp_created: org.timestamp_created || createTimestamp(),
          timestamp_updated: createTimestamp(),
        })
        history.push(`/admin/organizations/${org_id}`)
      } catch (e) {
        console.error('Error writing document: ', e)
      }
    }
  }

  async function handleDelete() {
    if (window.confirm(`Are you sure you want to delete ${org.name}?`)) {
      await setFirestoreData(['organizations', organization_id], {
        is_deleted: true,
      })
      history.push('/admin/organizations')
    }
  }

  function FormError() {
    if (showErrors === true) {
      return errors.map(error => <p id="FormError">{error}</p>)
    } else return null
  }

  return (
    <main id="EditOrganization">
      <Input
        type="text"
        label="Organization Name"
        element_id="name"
        value={formData.name}
        onChange={handleChange}
      />
      <Input
        type="select"
        label="Organization Type"
        element_id="type"
        value={formData.type}
        suggestions={ORG_TYPES}
        onSuggestionClick={handleChange}
      />
      {formData.type ? (
        <Input
          type="select"
          label={`${formData.type} Type`}
          element_id="subtype"
          value={formData.subtype}
          suggestions={
            formData.type === 'donor'
              ? Object.values(DONOR_TYPES)
              : Object.values(RECIPIENT_TYPES)
          }
          onSuggestionClick={handleChange}
        />
      ) : null}
      <FormError />
      <div id="EditOrganization-buttons">
        {organization_id && (
          <Button type="secondary" color="white" handler={handleDelete}>
            Delete Organization
          </Button>
        )}
        <Button
          type="primary"
          color="white"
          handler={() => {
            handleSubmit()
            setShowErrors(true)
          }}
        >
          {organization_id ? 'Update Organization' : 'Create Organization'}
        </Button>
      </div>
    </main>
  )
}
