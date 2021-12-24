import React, { useEffect, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import {
  updateFieldSuggestions,
  formFields,
  getDefaultStartTime,
  fetchExistingRouteData,
  getDefaultEndTime,
} from './utils'
import UserIcon from 'assets/user.svg'
import {
  createTimestamp,
  deleteFirestoreData,
  generateDirectionsLink,
  generateStopId,
  getCollection,
  setFirestoreData,
  STATUSES,
  updateGoogleCalendarEvent,
} from 'helpers'
import moment from 'moment'
import {
  EditDelivery,
  EditPickup,
  Input,
  Ellipsis,
  Loading,
  ReorderStops,
} from 'components'
import { useFirestore } from 'hooks'
import { v4 as generateUUID } from 'uuid'
import {
  Button,
  Spacer,
  Text,
  ExternalLink,
  Card,
} from '@sharingexcess/designsystem'

export function EditRescue() {
  const history = useHistory()
  const drivers = useFirestore('users')
  const { rescue_id } = useParams()
  const [formData, setFormData] = useState({
    // Any field used as an input value must be an empty string
    // others can and should be initialized as null
    handler_name: '',
    handler_id: null,
    time_start: getDefaultStartTime(),
    time_end: getDefaultEndTime(),
    type: 'retail',
    is_direct_link: false,
    stops: [],
  })
  const [suggestions, setSuggestions] = useState({
    // these will populate the dropdown suggestions for each input
    type: ['retail', 'wholesale'],
    handler_name: [],
    handler_id: [],
  })
  const [list, setList] = useState(rescue_id ? null : 'pickups')
  const [working, setWorking] = useState()
  const [confirmedTimes, setConfirmedTime] = useState(rescue_id ? true : null)
  const [errors, setErrors] = useState([])
  const [isSelectedCardId, setSelectedCardId] = useState(null)
  const [showErrors, setShowErrors] = useState(false)
  const [canRender, setCanRender] = useState(rescue_id ? false : true)
  const [deletedStops, setDeletedStops] = useState([])
  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function getExistingRouteData() {
      const existingRouteData = await fetchExistingRouteData(rescue_id)
      setFormData(prevFormData => ({
        ...prevFormData,
        ...existingRouteData,
      }))
      setSuggestions(prevSuggestions => ({
        ...prevSuggestions,
        handler_name: null,
      }))
      setCanRender(true)
    }
    drivers && rescue_id && getExistingRouteData()
  }, [rescue_id, drivers])

  useEffect(() => {
    formData.handler_id &&
      setFormData({
        ...formData,
        driver: drivers.find(i => i.id === formData.handler_id),
      })
  }, [formData.handler_id, drivers]) // eslint-disable-line

  function deselectStop(e) {
    if (e.target.id === 'EditRescue') {
      setSelectedCardId(null)
    }
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

  async function handleCreateRoute(formData, rescue_id) {
    setWorking(true)
    if (rescue_id) {
      const existing = fetchExistingRouteData(rescue_id)
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
      for (const stop of formData.stops) {
        if (stop.type === 'pickup') {
          await setFirestoreData(['pickups', stop.id], {
            id: stop.id,
            handler_id: formData.handler_id,
            rescue_id,
            donor_id: stop.donor_id,
            location_id: stop.location_id,
            status: stop.status || STATUSES.SCHEDULED,
            timestamp_created: stop.timestamp_created || createTimestamp(),
            timestamp_updated: createTimestamp(),
            timestamp_started: stop.timestamp_started || null,
            timestamp_arrived: stop.timestamp_arrived || null,
            timestamp_finished: stop.timestamp_finished || null,
            impact_data_dairy: stop.impact_data_dairy || 0,
            impact_data_bakery: stop.impact_data_bakery || 0,
            impact_data_produce: stop.impact_data_produce || 0,
            impact_data_meat_fish: stop.impact_data_meat_fish || 0,
            impact_data_non_perishable: stop.impact_data_non_perishable || 0,
            impact_data_prepared_frozen: stop.impact_data_prepared_frozen || 0,
            impact_data_mixed: stop.impact_data_mixed || 0,
            impact_data_other: stop.impact_data_other || 0,
            impact_data_total_weight: stop.impact_data_total_weight || 0,
          })
        } else if (stop.type === 'delivery') {
          await setFirestoreData(['deliveries', stop.id], {
            id: stop.id,
            handler_id: formData.handler_id,
            rescue_id,
            recipient_id: stop.recipient_id,
            location_id: stop.location_id,
            status: stop.status || STATUSES.SCHEDULED,
            timestamp_created: stop.timestamp_created || createTimestamp(),
            timestamp_updated: createTimestamp(),
            timestamp_started: stop.timestamp_started || null,
            timestamp_arrived: stop.timestamp_arrived || null,
            timestamp_finished: stop.timestamp_finished || null,
            impact_data_dairy: stop.impact_data_dairy || 0,
            impact_data_bakery: stop.impact_data_bakery || 0,
            impact_data_produce: stop.impact_data_produce || 0,
            impact_data_meat_fish: stop.impact_data_meat_fish || 0,
            impact_data_non_perishable: stop.impact_data_non_perishable || 0,
            impact_data_prepared_frozen: stop.impact_data_prepared_frozen || 0,
            impact_data_mixed: stop.impact_data_mixed || 0,
            impact_data_other: stop.impact_data_other || 0,
            impact_data_total_weight: stop.impact_data_total_weight || 0,
            impact_data_percent_of_total_dropped:
              stop.impact_data_percent_of_total_dropped || 0,
          })
        }
      }

      const event = await updateGoogleCalendarEvent(formData)

      if (!event.id) {
        alert('Error creating Google Calendar event. Please contact support!')
        return
      }
      const rescue = {
        id: rescue_id,
        type: formData.type,
        handler_id: formData.handler_id,
        google_calendar_event_id: event.id,
        stop_ids: formData.stops.map(s => s.id),
        is_direct_link: formData.is_direct_link,
        status: STATUSES.SCHEDULED,
        notes: '',
        timestamp_created: createTimestamp(),
        timestamp_updated: createTimestamp(),
        timestamp_scheduled_start: createTimestamp(formData.time_start),
        timestamp_scheduled_finish: createTimestamp(formData.time_end),
        timestamp_logged_start: null,
        timestamp_logged_finish: null,
      }
      getCollection('rescues')
        .doc(rescue_id)
        .set(rescue)
        .then(() => history.push(`/rescues/${rescue_id}`))
      setWorking(false)
    }
  }

  async function generateRescueId() {
    const createId = () =>
      `${generateUUID()}`
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
    } else if (field.id === 'handler_name') {
      setFormData({
        ...formData,
        driver: {},
        handler_id: '',
        handler_name: e.target.value,
      })
    } else setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  function handleSelect(_e, selected, field) {
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

  function Stop({ s, onMove, handleCardSelection, position, lengthOfStops }) {
    const isSelectedCard = isSelectedCardId === s.id
    function generateStopTitle() {
      return `${s.donor ? s.donor.name : s.recipient.name} (${
        s.location.name || s.location.address1
      })`
    }
    function StopAddress() {
      return (
        <ExternalLink
          to={generateDirectionsLink(
            s.location.address1,
            s.location.city,
            s.location.state,
            s.location.zip
          )}
        >
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
        classList={['Stop', s.type, isSelectedCard && 'selected-card']}
        onClick={() => handleCardSelection(s.id)}
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
            {s.type === 'pickup' ? '🟩 PICKUP' : '🟥 DELIVERY'}
          </Text>
          <Text type="section-header" color="black">
            {generateStopTitle()}
          </Text>
          <Spacer height={8} />
          <StopAddress />
        </div>
        {isSelectedCard && (
          <ReorderStops
            position={position}
            onMove={onMove}
            id={s.id}
            lengthOfStops={lengthOfStops}
          />
        )}
      </Card>
    )
  }

  function validateFormData() {
    if (!moment(formData.time_start).isValid()) {
      errors.push('Invalid Data Input: Start Time is invalid')
    }
    if (errors.length === 0) {
      return true
    }
    return false
  }

  function FormError() {
    if (showErrors === true) {
      return errors.map(error => <p id="FormError">{error}</p>)
    } else return null
  }

  function Driver() {
    return (
      <div id="EditRescue-driver">
        <img
          src={formData.driver ? formData.driver.icon : UserIcon}
          alt={formData.driver ? formData.driver.name : 'Unassigned Route'}
        />
        <div id="EditRescue-driver-info">
          <Text type="secondary-header" color="white" shadow>
            {formData.driver ? formData.driver.name : 'Unassigned Route'}
          </Text>
          <Text type="subheader" color="white" shadow>
            {`${moment(formData.time_start).format('dddd, MMMM D, h:mma')}${
              formData.time_end
                ? ' - ' + moment(formData.time_end).format('h:mma')
                : ''
            } `}
          </Text>
        </div>
        <Button
          id="EditRescue-driver-edit"
          type="secondary"
          handler={() => setConfirmedTime(false)}
        >
          Update Route Info
        </Button>
      </div>
    )
  }

  function SelectDriver() {
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
            id="EditRescue-confirm-button"
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
        {formFields.map(field =>
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
        const original_rescue_id =
          rescue_id || (await generateRescueId(formData.time_start))
        const FirstFormData = {
          ...formData,
          original_rescue_id: original_rescue_id,
        }
        handleCreateRoute(FirstFormData, original_rescue_id)
      }

      function generateSubmitButtonText() {
        return working ? (
          <>
            {rescue_id ? 'Updating Route' : 'Creating Route'}
            <Ellipsis />
          </>
        ) : rescue_id ? (
          'Update Route'
        ) : (
          'Create Route'
        )
      }

      return isValidRoute() && !list ? (
        <Button
          id="EditRescue-submit"
          size="large"
          type="secondary"
          handler={handleSubmit}
        >
          {generateSubmitButtonText()}
        </Button>
      ) : null
    }

    function getPosition(id) {
      const stops = formData.stops
      return stops.findIndex(i => i.id === id)
    }

    function handleMove(id, direction) {
      const stops = formData.stops
      const position = getPosition(id)
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

    function selectCard(id) {
      setSelectedCardId(id)
      setSelectedCardId(state => {
        return state
      })
    }

    function CancelButton() {
      return list ? (
        <Button
          id="EditRescue-cancel"
          type="secondary"
          handler={() => setList()}
        >
          Cancel
        </Button>
      ) : null
    }

    function AddPickupButton() {
      return !list ? (
        <Button id="EditRescue-add-pickup" handler={() => setList('pickups')}>
          Add Pickup
        </Button>
      ) : null
    }

    function AddDeliveryButton() {
      return formData.stops.length && !list ? (
        <Button
          id="EditRescue-add-delivery"
          handler={() => setList('delivery')}
        >
          Add Delivery
        </Button>
      ) : null
    }

    return confirmedTimes ? (
      <>
        {formData.stops.map(s => (
          <Stop
            s={s}
            key={s.id}
            onMove={handleMove}
            position={getPosition}
            lengthOfStops={formData.stops.length}
            handleCardSelection={selectCard}
          />
        ))}
        <section id="AddStop">
          {list === 'pickups' ? (
            <EditPickup handleSubmit={handleAddPickup} />
          ) : list === 'delivery' ? (
            <EditDelivery handleSubmit={handleAddDelivery} />
          ) : null}
        </section>
        <div id="EditRescue-buttons">
          <CancelButton />
          <AddPickupButton />
          <AddDeliveryButton />
          <SubmitButton />
        </div>
      </>
    ) : null
  }

  return (
    <main id="EditRescue" onClick={deselectStop}>
      <Text type="section-header" color="white" shadow>
        {rescue_id ? 'Edit Rescue' : 'Create Rescue'}
      </Text>
      <Text type="subheader" color="white" shadow>
        Use this form to schedule a driver for pickups within a specific time
        window.
      </Text>
      <Spacer height={24} />
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
