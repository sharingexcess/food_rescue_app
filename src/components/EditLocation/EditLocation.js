import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createTimestamp,
  DAYS,
  generateUniqueId,
  removeSpecialCharacters,
  setFirestoreData,
  TIMES,
} from 'helpers'
import { initializeFormData } from './utils'
import { useFirestore } from 'hooks'
import { Input, GoogleAutoComplete, GoogleMap, Loading } from 'components'
<<<<<<< HEAD
import { Emoji } from 'react-apple-emojis'
=======
>>>>>>> 3daa8b5... Adding Time Windows To Locations
import {
  Button,
  Spacer,
  Text,
  FlexContainer,
} from '@sharingexcess/designsystem'

export function EditLocation() {
  const { organization_id, location_id } = useParams()
  const navigate = useNavigate()
  const organization = useFirestore('organizations', organization_id)
  const location = useFirestore('locations', location_id)
  const [formData, setFormData] = useState({
    address1: '',
    address2: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
    nickname: '',
    hours: [],
    is_philabundance_partner: false,
  })
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    if (isInitialLoad && location && location.address1) {
      setIsInitialLoad(false)
      initializeFormData(location, setFormData)
    }
  }, [location, formData, isInitialLoad]) // eslint-disable-line

  function handleChange(e) {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  function validateFormData() {
    if (!formData.lat || !formData.lng) {
      window.alert('Address is not complete!')
    }
    // if (!formData.contact_phone) {
    //   window.alert('Phone number is required when adding a location!')
    //   return false
    // }
    return true
  }

  async function handleSubmit() {
    if (validateFormData()) {
      try {
        const new_location_id =
          location_id || (await generateUniqueId('locations'))
        await setFirestoreData(['locations', new_location_id], {
          id: new_location_id,
          organization_id,
          ...formData,
          contact_phone: removeSpecialCharacters(formData.contact_phone || ''),
          timestamp_created: location.timestamp_created || createTimestamp(),
          timestamp_updated: createTimestamp(),
        })
        navigate(`/admin/organizations/${organization_id}`)
      } catch (e) {
        console.error('Error writing document: ', e)
      }
    }
  }

  async function handleDelete() {
    if (
      window.confirm(`Are you sure you want to delete ${location.address1}?`)
    ) {
      await setFirestoreData(['locations', location_id], {
        is_deleted: true,
      })
      navigate('/admin/organizations')
    }
  }

  function handleReceiveAddress(address) {
    setFormData(prevData => ({ ...prevData, ...address }))
  }

<<<<<<< HEAD
<<<<<<< HEAD
  function Hours({ dayOfWeek, openTime, closeTime }) {
    return (
      <FlexContainer>
        <FlexContainer className="Inputs" primaryAlign="start">
          <Input
            type="select"
            element_id="day_of_week"
            value={dayOfWeek}
            onSuggestionClick={e => {
              handleChangeTimeSlot(dayOfWeek, openTime, closeTime, e)
            }}
            suggestions={DAYS}
            label={'Choose Day of Week'}
          />
          <Input
            type="select"
            element_id="time_open"
            value={openTime}
            onSuggestionClick={e =>
              handleChangeTimeSlot(dayOfWeek, openTime, closeTime, e)
            }
            suggestions={TIMES}
            label={'Open Time'}
          />
          <Input
            type="select"
            element_id="time_close"
            value={closeTime}
            onSuggestionClick={e =>
              handleChangeTimeSlot(dayOfWeek, openTime, closeTime, e)
            }
            suggestions={TIMES.slice(TIMES.indexOf(openTime) + 1)}
            label={'Close Time'}
          />
        </FlexContainer>
        <FlexContainer primaryAlign="end">
          <Button
            type="secondary"
            size="medium"
            color="white"
            classlist={['Input']}
            handler={() => handleChangeTimeSlot(dayOfWeek, openTime, closeTime)}
          >
            Delete TimeSlot
          </Button>
        </FlexContainer>
=======
  function AddHoursButton() {
    return (
      <Button
        type="primary"
        handler={() => {
          setFormData({
            ...formData,
            hours: [
              ...formData.hours,
              {
                day_of_week: 'Sunday',
                time_open: '8:00',
                time_close: '20:00',
              },
            ],
          })
        }}
      >
        Add Hours
      </Button>
    )
  }

=======
>>>>>>> fb3ddec... Moving Button component out of function
  function Hours({ dayOfWeek, openTime, closeTime }) {
    return (
<<<<<<< HEAD
      <FlexContainer primaryAlign="space-between">
        <Input
          type="select"
          element_id="day_of_week"
          value={dayOfWeek}
          onSuggestionClick={e => {
            handleChangeTimeSlot(dayOfWeek, openTime, closeTime, e)
          }}
          suggestions={DAYS}
          label={'Choose Day of Week'}
        />
        <Input
          type="select"
          element_id="time_open"
          value={openTime}
          onSuggestionClick={e =>
            handleChangeTimeSlot(dayOfWeek, openTime, closeTime, e)
          }
          suggestions={TIMES}
          label={'Open Time'}
        />
        <Input
          type="select"
          element_id="time_close"
          value={closeTime}
          onSuggestionClick={e =>
            handleChangeTimeSlot(dayOfWeek, openTime, closeTime, e)
          }
          suggestions={TIMES.slice(TIMES.indexOf(openTime) + 1)}
          label={'Close Time'}
        />
        <Button
          type="secondary"
          size="medium"
          color="white"
          handler={() => handleChangeTimeSlot(dayOfWeek, openTime, closeTime)}
        >
          Delete TimeSlot
        </Button>
>>>>>>> 3daa8b5... Adding Time Windows To Locations
=======
      <FlexContainer>
        <FlexContainer className="Inputs" primaryAlign="start">
          <Input
            type="select"
            element_id="day_of_week"
            value={dayOfWeek}
            onSuggestionClick={e => {
              handleChangeTimeSlot(dayOfWeek, openTime, closeTime, e)
            }}
            suggestions={DAYS}
            label={'Choose Day of Week'}
          />
          <Input
            type="select"
            element_id="time_open"
            value={openTime}
            onSuggestionClick={e =>
              handleChangeTimeSlot(dayOfWeek, openTime, closeTime, e)
            }
            suggestions={TIMES}
            label={'Open Time'}
          />
          <Input
            type="select"
            element_id="time_close"
            value={closeTime}
            onSuggestionClick={e =>
              handleChangeTimeSlot(dayOfWeek, openTime, closeTime, e)
            }
            suggestions={TIMES.slice(TIMES.indexOf(openTime) + 1)}
            label={'Close Time'}
          />
        </FlexContainer>
        <FlexContainer primaryAlign="end">
          <Button
            type="secondary"
            size="medium"
            color="white"
            classlist={['Input']}
            handler={() => handleChangeTimeSlot(dayOfWeek, openTime, closeTime)}
          >
            Delete TimeSlot
          </Button>
        </FlexContainer>
>>>>>>> bb1b2f7... Added Styling and fixed bug
      </FlexContainer>
    )
  }

  function handleChangeTimeSlot(day, open, close, e) {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> bb1b2f7... Added Styling and fixed bug
    const alter = formData.hours.findIndex(
      hour =>
        hour.day_of_week === day &&
        hour.time_open === open &&
        hour.time_close === close
    )
<<<<<<< HEAD
    if (e) {
      setFormData({
        ...formData,
        hours: formData.hours.map((hour, index) =>
          index === alter ? { ...hour, [e.target.id]: e.target.value } : hour
=======
    if (e) {
      setFormData({
        ...formData,
        hours: formData.hours.map(hour =>
          hour.day_of_week === day &&
          hour.time_open === open &&
          hour.time_close === close
            ? { ...hour, [e.target.id]: e.target.value }
            : hour
>>>>>>> 3daa8b5... Adding Time Windows To Locations
=======
    if (e) {
      setFormData({
        ...formData,
        hours: formData.hours.map((hour, index) =>
          index === alter ? { ...hour, [e.target.id]: e.target.value } : hour
>>>>>>> bb1b2f7... Added Styling and fixed bug
        ),
      })
    } else {
      setFormData({
        ...formData,
<<<<<<< HEAD
<<<<<<< HEAD
        hours: formData.hours.filter((element, index) => index !== alter),
=======
        hours: formData.hours.filter(
          hour =>
            !(
              hour.day_of_week === day &&
              hour.time_open === open &&
              hour.time_close === close
            )
        ),
>>>>>>> 3daa8b5... Adding Time Windows To Locations
=======
        hours: formData.hours.filter((element, index) => index !== alter),
>>>>>>> bb1b2f7... Added Styling and fixed bug
      })
    }
  }

  return !location || !organization ? (
    <Loading text="Loading location data..." />
  ) : (
    <main id="EditLocation">
      <Text type="secondary-header" color="white" shadow>
        {!location_id ? 'Create Location' : 'Edit Location'}
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
            <div className="EditLocation-address-pin">
              <Emoji name="round-pushpin" width={20} />
            </div>
            <Text type="section-header" color="white" shadow>
              {formData.address1}
              <br />
              {`${formData.city}, ${formData.state} ${formData.zip}`}
            </Text>
            <Button
              id="EditLocation-address-clear-button"
              type="secondary"
              handler={() => setFormData({ ...formData, address1: '' })}
            >
              Clear Address
            </Button>
          </div>
          <Spacer height={16} />
          <Input
            type="text"
            label="Apartment Number (optional)"
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
            type="text"
            label="Contact Email"
            element_id="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
          />
          <Input
            type="tel"
            label="Phone Number"
            element_id="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
          />
          <Input
            type="textarea"
            label="Notes + Instructions"
            element_id="notes"
            value={formData.notes}
            onChange={handleChange}
          />
          <Input
            type="text"
            label="Location Nickname (optional)"
            element_id="nickname"
            value={formData.nickname}
            onChange={handleChange}
          />
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> bb1b2f7... Added Styling and fixed bug
          <Text type="section-header" color="white" shadow>
            Time Windows
          </Text>
          <Spacer height={15} />
<<<<<<< HEAD
<<<<<<< HEAD
          {formData.hours.map((hour, index) => {
=======
=======
>>>>>>> bb1b2f7... Added Styling and fixed bug
          {formData.hours.map(hour => {
>>>>>>> 3daa8b5... Adding Time Windows To Locations
=======
          {formData.hours.map((hour, index) => {
>>>>>>> 55421b2... Fixed key error
            return (
              <Hours
                dayOfWeek={hour.day_of_week}
                openTime={hour.time_open}
                closeTime={hour.time_close}
<<<<<<< HEAD
<<<<<<< HEAD
                key={index}
              />
            )
          })}
          <div id="EditLocation-buttons">
            <Button
              type="primary"
              handler={() => {
                setFormData({
                  ...formData,
                  hours: [
                    ...formData.hours,
                    {
                      day_of_week: 'Sunday',
                      time_open: '8:00',
                      time_close: '20:00',
                    },
                  ],
                })
              }}
            >
              Add Hours
            </Button>
=======
                key={hour}
=======
                key={index}
>>>>>>> 55421b2... Fixed key error
              />
            )
          })}
<<<<<<< HEAD
          <div id="HoursOpen">
<<<<<<< HEAD
            <AddHoursButton />
>>>>>>> 3daa8b5... Adding Time Windows To Locations
=======
=======
          <div id="EditLocation-buttons">
>>>>>>> bb1b2f7... Added Styling and fixed bug
            <Button
              type="primary"
              handler={() => {
                setFormData({
                  ...formData,
                  hours: [
                    ...formData.hours,
                    {
                      day_of_week: 'Sunday',
                      time_open: '8:00',
                      time_close: '20:00',
                    },
                  ],
                })
              }}
            >
              Add Hours
            </Button>
>>>>>>> fb3ddec... Moving Button component out of function
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
              This location is a Philabundance Partner
            </Text>
          </div>
          <Spacer height={16} />
          <div id="EditLocation-buttons">
            <Button type="secondary" handler={handleDelete}>
              Delete Location
            </Button>
            <Button type="primary" handler={handleSubmit}>
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
