import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import 'firebase/firestore'
import { Input } from '../Input/Input'
import { getCollection } from '../../helpers/helpers'
import { initializeFormData, handleDeleteLocation } from './utils'
import useOrganizationData from '../../hooks/useOrganizationData'
import useLocationData from '../../hooks/useLocationData'
import Loading from '../Loading/Loading'
import GoogleAutoComplete from '../GoogleAutoComplete/GoogleAutoComplete'
import GoogleMap from '../GoogleMap/GoogleMap'
import Header from '../Header/Header'
import './EditLocation.scss'
import DeleteLocationModal from '../DeleteLocationModal/DeleteLocationModal'
import PhoneInput, { isPossiblePhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

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
  const [openModal, setOpenModal] = useState(false)
  const [canDelete, setCanDelete] = useState(true)
  const [locationRoutes, setLocationRoutes] = useState([])
  const [locationDeliveries, setLocationDeliveries] = useState([])
  const [locationPickups, setLocationPickups] = useState([])

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

  function handlePhoneInputChange(changeValue) {
    setFormData(prevData => {
      return { ...prevData, contact_phone: changeValue }
    })
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
  async function handleDeleteClick() {
    const {
      canDelete,
      locationRoutes,
      locationDeliveries,
      locationPickups,
    } = await handleDeleteLocation(loc_id)
    setCanDelete(canDelete)
    setLocationRoutes(locationRoutes)
    setLocationDeliveries(locationDeliveries)
    setLocationPickups(locationPickups)
    setOpenModal(true)
  }

  async function generateLocationId() {
    const uniq_id = `${organization.name}_${formData.name}_${
      formData.address1
    }${formData.address2 ? '_' + formData.address2 : ''}`
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
              Make this the Network's
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
              Make this Network
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
          {loc_id && (
            <button className="red" onClick={handleDeleteClick}>
              Delete Location
            </button>
          )}
          {openModal && (
            <DeleteLocationModal
              setOpenModal={setOpenModal}
              canDelete={canDelete}
              locationRoutes={locationRoutes}
              locationDeliveries={locationDeliveries}
              locationPickups={locationPickups}
              locationId={loc_id}
              orgId={organization.id}
            />
          )}
        </>
      ) : (
        <GoogleAutoComplete handleSelect={handleReceiveAddress} />
      )}
    </main>
  )
}
