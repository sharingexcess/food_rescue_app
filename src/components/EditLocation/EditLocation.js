import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import 'firebase/firestore'
import { Input } from '../Input/Input'
import { v4 as generateUniqueId } from 'uuid'
import './EditLocation.scss'
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore'
import { getCollection } from '../../helpers/helpers'
import { initializeFormData, required_fields } from './utils'
import { GoBack } from '../../helpers/components'

export default function EditLocation() {
  const { id, loc_id } = useParams()
  const history = useHistory()
  const [locations = []] = useCollectionData(
    getCollection('Organizations').doc(id).collection('Locations')
  )
  const [location = {}] = useDocumentData(
    loc_id
      ? getCollection('Organizations')
          .doc(id)
          .collection('Locations')
          .doc(loc_id)
      : null
  )
  const [formData, setFormData] = useState({
    name: '',
    upon_arrival_instructions: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip_code: '',
    is_primary: false,
  })
  const [error, setError] = useState()

  useEffect(() => {
    if (location.name && !formData.name) {
      initializeFormData(location, setFormData)
    }
  }, [location, formData]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(e) {
    setError(false)
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  function validateFormData() {
    for (const field of required_fields) {
      if (!formData[field].length) {
        return false
      }
    }
    return true
  }

  function handleSubmit() {
    const is_valid = validateFormData()
    if (is_valid) {
      const new_loc_id = loc_id || generateUniqueId()
      getCollection('Organizations')
        .doc(id)
        .collection('Locations')
        .doc(new_loc_id)
        .set(
          {
            id: new_loc_id,
            ...formData,
            is_primary: !locations.length ? true : formData.is_primary, // default to primary if first location
          },
          { merge: true }
        )
        .then(() => history.push(`/admin/organizations/${id}`))
        .catch(e => console.error('Error writing document: ', e))
    } else {
      setError(true)
    }
  }

  function FormError() {
    if (error)
      return (
        <p id="FormError">
          Missing in form data:{' '}
          {required_fields
            .map(i => (formData[i] ? null : i))
            .filter(Boolean)
            .join(', ')}{' '}
        </p>
      )
    else return null
  }

  return (
    <main id="EditLocation">
      <GoBack label="back to organization" url={`/admin/organizations/${id}`} />
      <h1>{loc_id ? 'Edit Location' : 'Add Location'}</h1>
      <Input
        type="text"
        label="Location Nickname *"
        element_id="name"
        value={formData.name}
        onChange={handleChange}
      />
      <Input
        type="text"
        label="Upon Arrival Instructions *"
        element_id="upon_arrival_instructions"
        value={formData.upon_arrival_instructions}
        onChange={handleChange}
      />
      <Input
        type="text"
        label="Address Line 1 *"
        element_id="address1"
        value={formData.address1}
        onChange={handleChange}
      />
      <Input
        type="text"
        label="Address Line 2"
        element_id="address2"
        value={formData.address2}
        onChange={handleChange}
      />
      <Input
        type="text"
        label="City *"
        element_id="city"
        value={formData.city}
        onChange={handleChange}
      />
      <Input
        type="text"
        label="State *"
        element_id="state"
        value={formData.state}
        onChange={handleChange}
      />
      <Input
        type="text"
        label="Zip Code *"
        element_id="zip_code"
        value={formData.zip_code}
        onChange={handleChange}
      />
      <div className="is_primary">
        <input
          type="checkbox"
          id="is_primary"
          name="is_primary"
          checked={formData.is_primary}
          onChange={() =>
            setFormData({ ...formData, is_primary: !formData.is_primary })
          }
        />
        <p>
          Make this the Organization's
          <br />
          Primary Address
        </p>
      </div>
      <FormError />
      <button onClick={handleSubmit}>
        {loc_id ? 'update location' : 'add location'}
      </button>
    </main>
  )
}
