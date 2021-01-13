import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import 'firebase/firestore'
import { Input } from '../Input/Input'
import { getCollection } from '../../helpers/helpers'
import { initializeFormData, required_fields } from './utils'
import { GoBack } from '../../helpers/components'
import useOrganizationData from '../../hooks/useOrganizationData'
import useLocationData from '../../hooks/useLocationData'
import Loading from '../Loading/Loading'
import './EditLocation.scss'
import StatesDropDown from '../StatesDropDown/StatesDropDown'

export default function EditLocation() {
  const { id, loc_id } = useParams()
  const history = useHistory()
  const organization = useOrganizationData(id)
  const location = useLocationData(loc_id)
  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    contact_phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip_code: '',
    upon_arrival_instructions: '',
  })
  const [isPrimary, setIsPrimary] = useState(
    loc_id && organization ? organization.primary_location === loc_id : false
  )
  const [error, setError] = useState()

  useEffect(() => {
    if (location && location.name && !formData.name) {
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

  async function handleSubmit() {
    const is_valid = validateFormData()
    if (is_valid) {
      const new_loc_id = loc_id || (await generateLocationId())
      if (new_loc_id) {
        if (isPrimary || !organization.primary_location) {
          getCollection('Organizations')
            .doc(id)
            .set({ primary_location: new_loc_id }, { merge: true })
        }
        getCollection('Locations')
          .doc(new_loc_id)
          .set(
            {
              id: new_loc_id,
              org_id: id,
              ...formData,
            },
            { merge: true }
          )
          .then(() => history.push(`/admin/organizations/${id}`))
          .catch(e => console.error('Error writing document: ', e))
      }
    } else {
      setError(true)
    }
  }

  async function generateLocationId() {
    const uniq_id = `${organization.name
      .toLowerCase()
      .replace(/[^A-Z0-9]/gi, '_')}_${formData.address1
      .replace(/[^A-Z0-9]/gi, '_')
      .toLowerCase()}`
    const exists = await getCollection('Organizations')
      .doc(uniq_id)
      .get()
      .then(res => res.data())
    if (exists) {
      alert('A location at this address already exists!')
      return null
    } else return uniq_id
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

  return !location ? (
    <Loading text="Loading location data..." />
  ) : (
    <main id="EditLocation">
      <GoBack />
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
        label="Contact Name"
        element_id="contact_name"
        value={formData.contact_name}
        onChange={handleChange}
      />
      <Input
        type="tel"
        label="Contact Phone"
        element_id="contact_phone"
        value={formData.contact_phone}
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
      {/* <Input
        type="text"
        label="State *"
        element_id="state"
        value={formData.state}
        onChange={handleChange}
      /> */}
      <StatesDropDown
        onChange={handleChange}
        element_id="state"
        value={formData.state}
      />
      <Input
        type="text"
        label="Zip Code *"
        element_id="zip_code"
        value={formData.zip_code}
        onChange={handleChange}
      />
      <Input
        type="text"
        label="Upon Arrival Instructions *"
        element_id="upon_arrival_instructions"
        value={formData.upon_arrival_instructions}
        onChange={handleChange}
      />
      <div className="is_primary">
        <input
          type="checkbox"
          id="is_primary"
          name="is_primary"
          checked={isPrimary}
          onChange={() => setIsPrimary(!isPrimary)}
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
