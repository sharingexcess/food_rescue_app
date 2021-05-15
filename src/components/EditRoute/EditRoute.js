import React, { memo, useEffect, useState } from 'react'
import { Input } from '../Input/Input'
import Ellipsis from '../../helpers/components'
import { Link } from 'react-router-dom'
import { useHistory } from 'react-router-dom'
import {
  updateFieldSuggestions,
  formFields,
  formFieldsRecurring,
  addDays,
  getDefaultStartTime,
  getDefaultEndTime,
  getDefaultEndRecurring,
  getTimeConflictInfo,
} from './utils'
import UserIcon from '../../assets/user.svg'
import {
  generateStopId,
  getCollection,
  setFirestoreData,
  updateGoogleCalendarEvent,
} from '../../helpers/helpers'
import moment from 'moment'
import EditDelivery from '../EditDelivery/EditDelivery'
import EditPickup from '../EditPickup/EditPickup'
import firebase from 'firebase/app'
import useUserData from '../../hooks/useUserData'
import useRouteData from '../../hooks/useRouteData'
import { v4 as generateUUID } from 'uuid'
import './EditRoute.scss'
import Header from '../Header/Header'
import { OrganizationHours } from '../Organization/utils'

function EditRoute() {
  const history = useHistory()
  const drivers = useUserData()
  const routes = useRouteData()
  const [formData, setFormData] = useState({
    // Any field used as an input value must be an empty string
    // others can and should be initialized as null
    driver_name: '',
    driver_id: null,
    time_start: getDefaultStartTime(),
    time_end: getDefaultEndTime(),
    end_recurring: getDefaultEndRecurring(),
    stops: [],
    original_route_id: '',
  })
  const [suggestions, setSuggestions] = useState({
    // these will populate the dropdown suggestions for each input
    driver_name: [],
    driver_id: [],
  })
  const [list, setList] = useState('pickups')
  const [working, setWorking] = useState()
  const [confirmedTimes, setConfirmedTime] = useState()
  const [errors, setErrors] = useState([])
  const [isRecurring, setRecurring] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const selectedFormFields = isRecurring ? formFieldsRecurring : formFields
  const [timeConflictInfo, setTimeConflictInfo] = useState({
    hasConflict: false,
    conflictRoutes: [],
  })
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    formData.driver_id &&
      setFormData({
        ...formData,
        driver: drivers.find(i => i.id === formData.driver_id),
      })
  }, [formData.driver_id, drivers]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (routes && formData.driver_id) {
      setTimeConflictInfo({
        ...getTimeConflictInfo(
          formData.driver_id,
          formData.time_start,
          formData.time_end,
          routes
        ),
      })
    }
  }, [routes, formData.driver_id, formData.time_start, formData.time_end])

  const Warning = () => {
    const [showConflictRoutes, setShowConflictRoutes] = useState(false)
    return (
      <div className="warning modal">
        <div className="modal-content">
          <div className="header">
            <p className={timeConflictInfo.hasConflict && 'short'}>
              Warning: Route with Conflict time exists
            </p>
            {timeConflictInfo.hasConflict && (
              <button
                className="blue small"
                onClick={() => setShowConflictRoutes(!showConflictRoutes)}
              >
                {showConflictRoutes ? 'Less' : 'More'}
              </button>
            )}
          </div>

          {showConflictRoutes &&
            timeConflictInfo.conflictRoutes.map(route => (
              <Link to={`/routes/${route.id}`} target="_blank">
                <p className="route">{route.id.slice(0, 14)}...</p>
              </Link>
            ))}
          <div className="footer">
            <button
              className="yellow small"
              onClick={() => setShowModal(false)}
            >
              Back
            </button>
            <button
              className="red small"
              onClick={() => {
                setShowModal(false)
                setConfirmedTime(true)
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    )
  }

  function handleAddPickup(pickup) {
    setList(false)
    const id = generateStopId(pickup)
    setFormData({
      ...formData,
      stops: [...formData.stops, { ...pickup, id, type: 'pickup' }],
    })
  }

  function handleAddDelivery(delivery) {
    setList(false)
    const id = generateStopId(delivery)
    setFormData({
      ...formData,
      stops: [...formData.stops, { ...delivery, id, type: 'delivery' }],
    })
  }

  async function handleCreateRouteButtonClick() {
    const original_route_id = await generateRouteId(formData.time_start)
    const FirstFormData = {
      ...formData,
      original_route_id: original_route_id,
    }
    handleCreateRoute(FirstFormData, original_route_id)
    if (isRecurring === true) {
      let updatedTimeStart = addDays(formData.time_start)
      let updatedTimeEnd = addDays(formData.time_end)
      let iteration = 1
      while (moment(updatedTimeStart).isSameOrBefore(formData.end_recurring)) {
        const route_id = await generateRouteId(updatedTimeStart)
        const updatedStops = []
        for (const stop of formData.stops) {
          const original_stop_id = stop.id
          const updatedStop = {
            ...stop,
            id: original_stop_id + iteration.toString(),
            original_stop_id: original_stop_id,
          }
          updatedStops.push(updatedStop)
        }
        const recurrenceFormData = {
          ...formData,
          time_start: updatedTimeStart,
          time_end: updatedTimeEnd,
          original_route_id: original_route_id,
          stops: updatedStops,
        }
        handleCreateRoute(recurrenceFormData, route_id)
        updatedTimeStart = addDays(updatedTimeStart)
        updatedTimeEnd = addDays(updatedTimeEnd)
        iteration += 1
      }
    }
  }

  async function handleCreateRoute(formData, route_id) {
    setWorking(true)
    if (route_id) {
      for (const [index, stop] of formData.stops.entries()) {
        if (stop.type === 'pickup') {
          await setFirestoreData(['Pickups', stop.id], {
            id: stop.id,
            original_stop_id: stop.original_stop_id
              ? stop.original_stop_id
              : '',
            org_id: stop.org_id,
            location_id: stop.location_id,
            driver_id: formData.driver_id,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            updated_at: firebase.firestore.FieldValue.serverTimestamp(),
            status: 1,
            route_id,
          })
        } else if (stop.type === 'delivery') {
          const pickup_ids = getPickupsInDelivery(index)
          await setFirestoreData(['Deliveries', stop.id], {
            id: stop.id,
            org_id: stop.org_id,
            original_stop_id: stop.original_stop_id
              ? stop.original_stop_id
              : '',
            location_id: stop.location_id,
            driver_id: formData.driver_id,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            updated_at: firebase.firestore.FieldValue.serverTimestamp(),
            status: 1,
            pickup_ids,
            route_id,
          })
        }
      }

      const event = await updateGoogleCalendarEvent(formData)

      if (!event.id) {
        alert('Error creating Google Calendar event. Please contact support!')
        return
      }
      getCollection('Routes')
        .doc(route_id)
        .set({
          id: route_id,
          google_calendar_event_id: event.id,
          driver_id: formData.driver_id,
          time_start: formData.time_start,
          time_end: formData.time_end,
          stops: formData.stops.map(s => ({ id: s.id, type: s.type })),
          created_at: firebase.firestore.FieldValue.serverTimestamp(),
          updated_at: firebase.firestore.FieldValue.serverTimestamp(),
          status: 1,
        })
        .then(() => history.push(`/routes/${route_id}`))
      setWorking(false)
    }
  }

  async function generateRouteId() {
    let uniq_id =
      `${formData.driver ? formData.driver.name + '_' : ''}` +
      generateUUID()
        .replace(/[^A-Z0-9]/gi, '_')
        .toLowerCase()

    let exists = await getCollection('Routes')
      .doc(uniq_id)
      .get()
      .then(res => res.data())
    while (exists) {
      uniq_id =
        `${formData.driver ? formData.driver.name + '_' : ''}` +
        generateUUID()
          .replace(/[^A-Z0-9]/gi, '_')
          .toLowerCase()
      exists = await getCollection('Routes')
        .doc(uniq_id)
        .get()
        .then(res => res.data())
    }
    return uniq_id
  }
  function getPickupsInDelivery(index) {
    const sliced = formData.stops.slice(0, index)
    for (let i = index - 1; i >= 0; i--) {
      if (sliced[i].type === 'delivery') {
        if (sliced.slice(i + 1, sliced.length).length < 1) {
          // this is delivery shares pickups with another delivery, continue
          sliced.pop()
        } else return sliced.slice(i + 1, sliced.length).map(j => j.id)
      }
    }
    return sliced.map(j => j.id)
  }

  function handleRemoveStop(id) {
    setFormData({
      ...formData,
      stops: formData.stops.filter(s => s.id !== id),
    })
  }

  function isValidRoute() {
    if (
      formData.stops.find(s => s.type === 'pickup') &&
      formData.stops.find(s => s.type === 'delivery') &&
      formData.stops[formData.stops.length - 1].type === 'delivery'
    ) {
      return true
    }
    return false
  }

  function handleChange(e, field) {
    setErrors([])
    setShowErrors(false)
    if (field.suggestionQuery) {
      updateFieldSuggestions(
        e.target.value,
        drivers,
        field,
        suggestions,
        setSuggestions
      )
    }
    if (field.id === 'time_start') {
      // automatically set time end 2 hrs later
      const time_end = new Date(e.target.value)
      time_end.setTime(time_end.getTime() + 2 * 60 * 60 * 1000)
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
        time_end: moment(time_end).format('yyyy-MM-DDTHH:mm'),
      })
    } else if (field.id === 'driver_name') {
      setFormData({
        ...formData,
        driver: {},
        driver_id: '',
        driver_name: e.target.value,
      })
    } else setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  function handleSelect(e, selected, field) {
    if (field.type !== 'select') {
      setSuggestions({ ...suggestions, [field.id]: null })
    }
    const updated_fields = field.handleSelect(selected)
    updated_fields && setFormData({ ...formData, ...updated_fields })
  }

  function handleDropdownSelect(e, field) {
    handleSelect(
      e,
      suggestions[field.id].find(s => s.id === e.target.value),
      field
    )
  }
  function Stop({ s }) {
    return (
      <div className={`Stop ${s.type}`}>
        <div>
          <i className="fa fa-times" onClick={() => handleRemoveStop(s.id)} />
          <h4>
            <i
              className={
                s.type === 'pickup' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'
              }
            />
            {s.type}
          </h4>
          <h2>
            {s.org.name}{' '}
            {s.location.name && s.location.name !== s.org.name
              ? `(${s.location.name})`
              : ''}
          </h2>
          <p class="philabundance">
            {s.location.is_philabundance_partner ? 'Philabundance Partner' : ''}
          </p>
          <p>
            {s.location.address1}
            {s.location.address2 && ` - ${s.location.address2}`}
          </p>
          <p>
            {s.location.city}, {s.location.state} {s.location.zip_code}
          </p>
          <OrganizationHours org={s.location} org_type={s.org.org_type} />
        </div>
      </div>
    )
  }

  function validateFormData() {
    if (isRecurring === false) {
      if (!moment(formData.time_start).isValid()) {
        errors.push('Invalid Data Input: Start Time is invalid')
      }
      if (!moment(formData.time_end).isValid()) {
        errors.push('Invalid Data Input: End Time is invalid')
      }
      if (moment(formData.time_end).isSameOrBefore(formData.time_start)) {
        errors.push('Invalid Data Input: End Time is before Start Time')
      }
      if (errors.length === 0) {
        return true
      }
      return false
    } else {
      if (errors.length === 0) {
        return true
      }
      return false
    }
  }

  function FormError() {
    if (showErrors === true) {
      return errors.map(error => <p id="FormError">{error}</p>)
    } else return null
  }
  return (
    <main id="EditRoute">
      <Header text="New Route" />
      {confirmedTimes ? (
        <div id="Driver">
          <img
            src={formData.driver ? formData.driver.icon : UserIcon}
            alt={formData.driver ? formData.driver.name : 'Unassigned Route'}
          />
          <div>
            <h3>
              {formData.driver ? formData.driver.name : 'Unassigned Route'}
            </h3>
            <h4>
              {isRecurring
                ? moment(formData.time_start).format('dddd') + ', Recurring'
                : moment(formData.time_start).format('dddd, MMMM D')}
            </h4>
            <h5>
              {moment(formData.time_start).format('h:mma')} -{' '}
              {moment(formData.time_end).format('h:mma')}
            </h5>
          </div>
          <button onClick={() => setConfirmedTime(false)}>
            Update Route Info
          </button>
          <Link to="/admin/create-organization">
            <button className="create">Create an Organization</button>
          </Link>
        </div>
      ) : (
        <>
          <div id="Recurring">
            <input
              type="checkbox"
              id="is_recurring"
              name="is_recurring"
              checked={isRecurring}
              onChange={() => setRecurring(!isRecurring)}
            />
            <p className="text"> Recurring Route</p>
          </div>
          {selectedFormFields.map(field =>
            !field.preReq || formData[field.preReq] ? (
              <Input
                key={field.id}
                element_id={field.id}
                type={field.type}
                label={field.label}
                value={formData[field.id]}
                onChange={e => handleChange(e, field)}
                suggestions={suggestions[field.id]}
                onSuggestionClick={
                  field.type === 'select'
                    ? e => handleDropdownSelect(e, field)
                    : (e, s) => handleSelect(e, s, field)
                }
                animation={false}
              />
            ) : null
          )}
          <FormError />
          {formData.time_end && (
            <button
              onClick={() => {
                validateFormData()
                  ? timeConflictInfo.hasConflict
                    ? setShowModal(true)
                    : setConfirmedTime(true)
                  : setShowErrors(true)
              }}
            >
              {formData.stops.length ? 'confirm' : 'add pickups'}
            </button>
          )}
          {showModal && <Warning />}
        </>
      )}
      {confirmedTimes ? (
        <>
          {formData.stops.map(s => (
            <Stop s={s} key={s.id} />
          ))}
          <section id="AddStop">
            {list === 'pickups' ? (
              <EditPickup handleSubmit={handleAddPickup} />
            ) : list === 'delivery' ? (
              <EditDelivery handleSubmit={handleAddDelivery} />
            ) : null}
          </section>
          <div className="add">
            {list ? (
              <button className="cancel" onClick={() => setList()}>
                cancel
              </button>
            ) : (
              <>
                <button className="pickup" onClick={() => setList('pickups')}>
                  add pickup
                </button>
                {formData.stops.length ? (
                  <button
                    className="delivery"
                    onClick={() => setList('delivery')}
                  >
                    add delivery
                  </button>
                ) : null}
                {isValidRoute() && (
                  <button
                    className="complete"
                    onClick={
                      working
                        ? null
                        : () => {
                            handleCreateRouteButtonClick()
                          }
                    }
                  >
                    {working ? (
                      <>
                        creating
                        <Ellipsis />
                      </>
                    ) : (
                      'create route'
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </>
      ) : null}
    </main>
  )
}

export default memo(EditRoute)
