import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import 'firebase/firestore'
import { Input } from '../Input/Input'
import { getCollection } from '../../helpers/helpers'
import { initializeFormData } from './utils'
import useOrganizationData from '../../hooks/useOrganizationData'
import useLocationData from '../../hooks/useLocationData'
import Loading from '../Loading/Loading'
import GoogleAutoComplete from '../GoogleAutoComplete/GoogleAutoComplete'
import GoogleMap from '../GoogleMap/GoogleMap'
import Header from '../Header/Header'
import './EditLocation.scss'
import validator from 'validator'

export default function EditLocation() {
  const { id, loc_id } = useParams()
  const history = useHistory()
  const organization = useOrganizationData(id)
  const location = useLocationData(loc_id)
  const [formData, setFormData] = useState({
    name: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip_code: '',
    contact_name: '',
    contact_phone: '',
    secondary_contact_phone: '',
    upon_arrival_instructions: '',
    is_philabundance_partner: '',
  })
  const [isPrimary, setIsPrimary] = useState(
    loc_id && organization ? organization.primary_location === loc_id : false
  )
  const [errors, setErrors] = useState([])
  const [showErrors, setShowErrors] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    if (isInitialLoad && location && location.name) {
      setIsInitialLoad(false)
      initializeFormData(location, setFormData)
    }
  }, [location, formData, isInitialLoad]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(e) {
    setFormData({ ...formData, [e.target.id]: e.target.value })
    setErrors([])
    setShowErrors(false)
  }

  function validateFormData() {
    const updatedErrors = [...errors]
    if (formData.name === '') {
      updatedErrors.push('Missing Location Name')
    }
    if (formData.address1 === '') {
      updatedErrors.push('Missing Address')
    }
    // OPTIONAL FIELDS: check if they're empty, if not, they'll be validated
    if (
      formData.contact_phone !== '' &&
      !validator.isMobilePhone(formData.contact_phone)
    ) {
      updatedErrors.push('Invalid Contact phone')
    }
    setErrors(updatedErrors)
    return updatedErrors.length === 0
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
    if (showErrors === true) {
      return errors.map(error => (
        <p id="FormError" key={error}>
          {error}
        </p>
      ))
    } else return null
  }

  function handleReceiveAddress(address) {
    setFormData(prevData => ({ ...prevData, ...address }))
  }

  return !location ? (
    <Loading text="Loading location data..." />
  ) : (
    <main id="EditLocation">
      <Header text={loc_id ? 'Edit Location' : 'Add Location'} />

      <Input
        type="text"
        label="Location Nickname *"
        element_id="name"
        value={formData.name}
        onChange={handleChange}
      />
      {formData.address1 ? (
        <>
          {formData.lat && formData.lng ? (
            <GoogleMap address={formData} />
          ) : null}
          <div id="Address">
            <i className="fa fa-map-marker" />
            <h4>
              {formData.address1}
              <br />
              {`${formData.city}, ${formData.state} ${formData.zip_code}`}
            </h4>
            <button onClick={() => setFormData({ ...formData, address1: '' })}>
              clear
            </button>
          </div>
          <Input
            type="text"
            label="Apartment/Unit Number"
            element_id="address2"
            value={formData.address2}
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
            type="tel"
            label="Secondary Contact Phone"
            element_id="secondary_contact_phone"
            value={formData.secondary_contact_phone}
            onChange={handleChange}
          />
          <Input
            type="textarea"
            label="Arrival Instructions"
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
          <div className="is_philabundance_partner">
            <input
              type="checkbox"
              id="is_philabundance_partner"
              name="is_philabundance_partner"
              checked={formData.is_philabundance_partner}
              onChange={() =>
                setFormData({
                  ...formData,
                  is_philabundance_partner: !formData.is_philabundance_partner,
                })
              }
            />
            <p>
              Make this the Organization
              <br />a Philabundance Partner
            </p>
          </div>
          <FormError />
          <br />
          <button
            onClick={() => {
              handleSubmit()
              setShowErrors(true)
            }}
          >
            {loc_id ? 'update location' : 'add location'}
          </button>{' '}
        </>
      ) : (
        <GoogleAutoComplete handleSelect={handleReceiveAddress} />
      )}
    </main>
  )
}
