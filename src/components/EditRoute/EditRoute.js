import React, { useEffect, useState} from 'react'
import firebase from 'firebase/app'
import { useParams, useHistory } from 'react-router-dom'
import {
  updateFieldSuggestions,
  formFields,
  formFieldsRecurring,
  addDays,
  getDefaultStartTime,
  getDefaultEndRecurring,
  getExistingRouteData,
  getDefaultEndTime,
} from './utils'
import UserIcon from 'assets/user.svg'
import {
  deleteFirestoreData,
  generateStopId,
  getCollection,
  setFirestoreData,
  updateGoogleCalendarEvent,
} from 'helpers'
import moment from 'moment'
import { EditDelivery, EditPickup, Input, Ellipsis, Loading } from 'components'
import { useFirestore } from 'hooks'
import { v4 as generateUUID } from 'uuid'
import { OrganizationHours } from '../Organization/utils'
import {
  Button,
  Spacer,
  Text,
  ExternalLink,
  Card,
} from '@sharingexcess/designsystem'

export function EditRoute() {
  const history = useHistory()
  const drivers = useFirestore('users')
  const { route_id } = useParams()
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
  const [list, setList] = useState(route_id ? null : 'pickups')
  const [working, setWorking] = useState()
  const [confirmedTimes, setConfirmedTime] = useState(route_id ? true : null)
  const [errors, setErrors] = useState([])
  const [isRecurring, setRecurring] = useState(false)
  const [isSelectedCard, setSelectedCard] = useState(false)
  const [isSelectedCardId, setSelectedCardId] = useState(null)
  const [showErrors, setShowErrors] = useState(false)
  const selectedFormFields = isRecurring ? formFieldsRecurring : formFields
  const [canRender, setCanRender] = useState(route_id ? false : true)
  const [deletedStops, setDeletedStops] = useState([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    if (drivers && route_id) {
      const existingRouteData = await getExistingRouteData(route_id)
      setFormData(prevFormData => ({
        ...prevFormData,
        ...existingRouteData,
      }))
      setSuggestions(prevSuggestions => ({
        ...prevSuggestions,
        driver_name: null,
      }))
      setCanRender(true)
    }
  }, [route_id, drivers])

  useEffect(() => {
    formData.driver_id &&
      setFormData({
        ...formData,
        driver: drivers.find(i => i.id === formData.driver_id),
      })
  }, [formData.driver_id, drivers]) // eslint-disable-line

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

  async function handleCreateRoute(formData, route_id) {
    setWorking(true)
    if (route_id) {
      const existing = getExistingRouteData(route_id)
      if (existing) {
        // if this is an existing route with pre-created stops,
        // make sure we delete any old and now deleted pickups and deliveries
        for (const stop of deletedStops) {
          await deleteFirestoreData([
            stop.type === 'pickup' ? 'Pickups' : 'Deliveries',
            stop.id,
          ])
        }
      }
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
            created_at:
              stop.created_at ||
              firebase.firestore.FieldValue.serverTimestamp(),
            updated_at: firebase.firestore.FieldValue.serverTimestamp(),
            status: stop.status || 1,
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
            created_at:
              stop.created_at ||
              firebase.firestore.FieldValue.serverTimestamp(),
            updated_at: firebase.firestore.FieldValue.serverTimestamp(),
            status: stop.status || 1,
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
          stops: formData.stops.map(s => ({ id: s.id, type: s.type })),
          created_at:
            formData.created_at ||
            firebase.firestore.FieldValue.serverTimestamp(),
          updated_at: firebase.firestore.FieldValue.serverTimestamp(),
          status: formData.status || 1,
        })
        .then(() => history.push(`/routes/${route_id}`))
      setWorking(false)
    }
  }

  async function generateRouteId() {
    const createId = () =>
      `${formData.driver ? formData.driver.name + '_' : ''}${generateUUID()}`
        .replace(/[^A-Z0-9]/gi, '_')
        .replace(' ', '_')
        .toLowerCase()

    const exists = async id =>
      await getCollection('Routes')
        .doc(id)
        .get()
        .then(res => res.data())

    let uniqId
    let idExists = true
    while (idExists) {
      uniqId = createId()
      idExists = await exists(uniqId)
    }
    return uniqId
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

  async function handleRemoveStop(id, type) {
    setFormData({
      ...formData,
      stops: formData.stops.filter(s => s.id !== id),
    })
    setDeletedStops(currDeletedStops => [...currDeletedStops, { id, type }])
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
  function Stop({ s, onMove, handleTest }) {
    function generateStopTitle() {
      return `${s.org.name} (${s.location.name || s.location.address1})`
    }
    function StopAddress() {
      function generateDirectionsLink(addressObj) {
        const base_url = 'https://www.google.com/maps/dir/?api=1&destination='
        return `${base_url}${addressObj.address1}+${addressObj.city}+${addressObj.state}+${addressObj.zip_code}`
      }

      return (
        <ExternalLink to={generateDirectionsLink(s.location)}>
          <Button
            classList={['Route-stop-address-button']}
            type="tertiary"
            size="small"
            color="blue"
          >
            <div>🏢</div>
            <Spacer width={16} />
            {s.location.address1}
            {s.location.address2 && ` - ${s.location.address2}`}
            <br />
            {s.location.city}, {s.location.state} {s.location.zip_code}
          </Button>
        </ExternalLink>
      )
    }

    return (
      <Card
        classList={[
          'Stop',
          s.type,
          isSelectedCardId == s.id && 'selected-card',
        ]}
        onClick={() => handleTest(s.id)}
      >
        <div>
          {s.can_delete !== false && (
            <i
              className="fa fa-times"
              onClick={() => handleRemoveStop(s.id, s.type)}
            />
          )}
          <Text
            type="small-header"
            color={s.type === 'pickup' ? 'green' : 'red'}
          >
            {s.type === 'pickup' ? '⬆️ PICKUP' : '⬇️ DELIVERY'}
          </Text>
          <Text type="section-header" color="black">
            {generateStopTitle()}
          </Text>
          <Spacer height={8} />
          <StopAddress />
          <OrganizationHours org={s.location} org_type={s.org.org_type} />
        </div>
        {isSelectedCardId == s.id && (
          <div className="reorder-button-container">
            <button className="reorder-button" onClick={() => onMove(s.id, -1)}>
              <i className="fas fa-chevron-up" />
            </button>
            <button className="reorder-button" onClick={() => onMove(s.id, 1)}>
              <i className="fas fa-chevron-down" />
            </button>
          </div>
        )}
      </Card>
    )
  }

  function validateFormData() {
    if (isRecurring === false) {
      if (!moment(formData.time_start).isValid()) {
        errors.push('Invalid Data Input: Start Time is invalid')
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

  function Driver() {
    return (
      <div id="EditRoute-driver">
        <img
          src={formData.driver ? formData.driver.icon : UserIcon}
          alt={formData.driver ? formData.driver.name : 'Unassigned Route'}
        />
        <div id="EditRoute-driver-info">
          <Text type="secondary-header" color="white" shadow>
            {formData.driver ? formData.driver.name : 'Unassigned Route'}
          </Text>
          <Text type="subheader" color="white" shadow>
            {isRecurring
              ? moment(formData.time_start).format('dddd') + ', Recurring'
              : `${moment(formData.time_start).format('dddd, MMMM D, h:mma')}${
                  formData.time_end
                    ? ' - ' + moment(formData.time_end).format('h:mma')
                    : null
                } `}
          </Text>
        </div>
        <Button
          id="EditRoute-driver-edit"
          type="secondary"
          handler={() => setConfirmedTime(false)}
        >
          Update Route Info
        </Button>
      </div>
    )
  }

  function SelectDriver() {
    function SetRecurringRoute() {
      return !route_id ? (
        <div id="Recurring">
          <input
            type="checkbox"
            id="is_recurring"
            name="is_recurring"
            checked={isRecurring}
            onChange={() => setRecurring(!isRecurring)}
          />
          <Spacer width={4} />
          <Text type="subheader" color="white">
            {' '}
            Recurring Route
          </Text>
        </div>
      ) : null
    }

    function ConfirmTimesButton() {
      function handleClick() {
        if (validateFormData()) {
          setConfirmedTime(true)
        } else setShowErrors(true)
      }

      return (
        formData.time_start &&
        canRender && (
          <Button
            id="EditRoute-confirm-button"
            type="primary"
            color="white"
            handler={handleClick}
          >
            {formData.stops.length ? 'Confirm' : 'Add Pickups'}
          </Button>
        )
      )
    }

    return (
      <>
        <SetRecurringRoute />
        {selectedFormFields.map(field =>
          (!field.preReq || formData[field.preReq]) && canRender ? (
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
        <ConfirmTimesButton />
      </>
    )
  }

  function SelectStops() {
    function SubmitButton() {
      async function handleSubmit() {
        if (working) return
        const original_route_id =
          route_id || (await generateRouteId(formData.time_start))
        const FirstFormData = {
          ...formData,
          original_route_id: original_route_id,
        }
        handleCreateRoute(FirstFormData, original_route_id)
        if (isRecurring === true) {
          let updatedTimeStart = addDays(formData.time_start)
          let iteration = 1
          while (
            moment(updatedTimeStart).isSameOrBefore(formData.end_recurring)
          ) {
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
              original_route_id: original_route_id,
              stops: updatedStops,
            }
            handleCreateRoute(recurrenceFormData, route_id)
            updatedTimeStart = addDays(updatedTimeStart)
            iteration += 1
          }
        }
      }

      function generateSubmitButtonText() {
        return working ? (
          <>
            {route_id ? 'Updating Route' : 'Creating Route'}
            <Ellipsis />
          </>
        ) : route_id ? (
          'Update Route'
        ) : (
          'Create Route'
        )
      }

      return isValidRoute() && !list ? (
        <Button id="EditRoute-submit" size="large" handler={handleSubmit}>
          {generateSubmitButtonText()}
        </Button>
      ) : null
    }

    function handleMove(id, direction) {
      const stops = formData.stops
      const position = stops.findIndex(i => i.id === id)
      if (position < 0) {
        throw new Error('Stop not found')
      } else if (
        (direction === -1 && position === 0) ||
        (direction === 1 && position === stops.length - 1)
      ) {
        return
      }
      const stop = stops[position]
      const newStops = stops.filter(i => i.id !== id)
      newStops.splice(position + direction, 0, stop)

      setFormData({
        ...formData,
        stops: [...newStops],
      })

    }

    function testFunction(id) {
      if (isSelectedCardId == id) {
        setSelectedCardId(null)
      } else {
        setSelectedCardId(id)
      }
     
        setSelectedCardId((state) => {
          return state;
        });
    }

    function CancelButton() {
      return list ? (
        <Button
          id="EditRoute-cancel"
          type="secondary"
          handler={() => setList()}
        >
          Cancel
        </Button>
      ) : null
    }

    function AddPickupButton() {
      return !list ? (
        <Button id="EditRoute-add-pickup" handler={() => setList('pickups')}>
          Add Pickup
        </Button>
      ) : null
    }

    function AddDeliveryButton() {
      return formData.stops.length && !list ? (
        <Button id="EditRoute-add-delivery" handler={() => setList('delivery')}>
          Add Delivery
        </Button>
      ) : null
    }

    return confirmedTimes ? (
      <>
        {formData.stops.map(s => (
          <Stop s={s} key={s.id} onMove={handleMove} handleTest={testFunction}/>
        ))}
        <section id="AddStop">
          {list === 'pickups' ? (
            <EditPickup handleSubmit={handleAddPickup} />
          ) : list === 'delivery' ? (
            <EditDelivery handleSubmit={handleAddDelivery} />
          ) : null}
        </section>
        <div id="EditRoute-buttons">
          <CancelButton />
          <AddPickupButton />
          <AddDeliveryButton />
          <SubmitButton />
        </div>
      </>
    ) : null
  }

  return (
    <main id="EditRoute">
      {canRender ? (
        <>
          {confirmedTimes ? <Driver /> : SelectDriver()}
          <SelectStops />
        </>
      ) : (
        <Loading />
      )}
    </main>
  )
}
