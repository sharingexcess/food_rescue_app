import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import PhoneInput, { isPossiblePhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import 'firebase/firestore'
import { getCollection } from 'helpers'
import { initializeFormData } from './utils'
import { useFirestore } from 'hooks'
import { Input, GoogleAutoComplete, GoogleMap, Loading } from 'components'
import { Button, Spacer, Text } from '@sharingexcess/designsystem'

export function EditLocation() {
  const { id, loc_id } = useParams()
  const history = useHistory()
  const organization = useFirestore('organizations', id)
  const location = useFirestore('locations', loc_id)
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
    time_open: '',
    time_close: '',
    receive_start: '',
    receive_end: '',
  })
  const [isPrimary, setIsPrimary] = useState(
    loc_id && organization ? organization.primary_location === loc_id : false
  )
  const [errors, setErrors] = useState([])
  const [showErrors, setShowErrors] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    if (isInitialLoad && location && location.address1) {
      setIsInitialLoad(false)
      initializeFormData(location, setFormData)
    }
  }, [location, formData, isInitialLoad]) // eslint-disable-line

  function handleChange(e) {
    setFormData({ ...formData, [e.target.id]: e.target.value })
    setErrors([])
    setShowErrors(false)
  }

  function handlePhoneInputChange(changeValue) {
    setFormData(prevData => {
      return { ...prevData, contact_phone: changeValue }
    })
    setErrors([])
    setShowErrors(false)
  }

  function validateFormData() {
    const updatedErrors = [...errors]
    if (formData.address1 === '') {
      updatedErrors.push('Missing Address')
    }
    if (
      formData.contact_phone &&
      !isPossiblePhoneNumber(formData.contact_phone)
    ) {
      updatedErrors.push('Contact Phone Number is invalid')
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
    const uniq_id = `${organization.name}_${formData.address1}${
      formData.address2 ? '_' + formData.address2 : ''
    }`
      .replace(/[^A-Z0-9]/gi, '_')
      .toLowerCase()
    const exists = await getCollection('Locations')
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
  return !location || !organization ? (
    <Loading text="Loading location data..." />
  ) : (
    <main id="EditLocation">
      <Text type="secondary-header" color="white" shadow>
        Edit Location
      </Text>
      <Text type="subheader" color="white" shadow>
        Use this form to save a location for the {organization.name}{' '}
        organization.
      </Text>
      {formData.address1 ? (
        <>
          {formData.lat && formData.lng ? (
            <>
              <Spacer height={24} />
              <GoogleMap address={formData} />
              <Spacer height={24} />
            </>
          ) : null}
          <div id="EditLocation-address">
            <div className="EditLocation-address-pin">📍</div>
            <Text type="section-header" color="white" shadow>
              {formData.address1}
              <br />
              {`${formData.city}, ${formData.state} ${formData.zip_code}`}
            </Text>
            <Button
              id="EditLocation-address-clear-button"
              type="secondary"
              handler={() => setFormData({ ...formData, address1: '' })}
            >
              Clear Address
            </Button>
          </div>
          <Spacer height={32} />
          <Input
            type="text"
            label="Location Nickname (optional)"
            element_id="name"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            type="text"
            label="Apartment/Unit Number (optional)"
            element_id="address2"
            value={formData.address2}
            onChange={handleChange}
          />
          <Input
            type="time"
            label="Open"
            element_id="time_open"
            value={formData.time_open}
            onChange={handleChange}
          />
          <Input
            type="time"
            label="Close"
            element_id="time_close"
            value={formData.time_close}
            onChange={handleChange}
          />
          <h4>Pickup/Receive Hours</h4>
          <Input
            type="time"
            label="Start"
            element_id="receive_start"
            value={formData.receive_start}
            onChange={handleChange}
          />
          <Input
            type="time"
            label="End"
            element_id="receive_end"
            value={formData.receive_end}
            onChange={handleChange}
          />
          <Input
            type="text"
            label="Contact Name"
            element_id="contact_name"
            value={formData.contact_name}
            onChange={handleChange}
          />
          <PhoneInput
            placeholder="Contact Phone"
            value={formData.contact_phone}
            onChange={handlePhoneInputChange}
            defaultCountry="US"
          />
          <Input
            type="tel"
            label="Secondary Phone (optional)"
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
            <Text type="paragraph" color="white" shadow>
              Make this the Network's Primary Address
            </Text>
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
            <Text type="paragraph" color="white" shadow>
              Make this Network a Philabundance Partner
            </Text>
          </div>
          <FormError />
          <Spacer height={16} />
          <div id="EditLocation-buttons">
            <Button
              type="primary"
              handler={() => {
                handleSubmit()
                setShowErrors(true)
              }}
            >
              Save Location
            </Button>
          </div>
        </>
      ) : (
        <GoogleAutoComplete handleSelect={handleReceiveAddress} />
      )}
    </main>
  )
}
