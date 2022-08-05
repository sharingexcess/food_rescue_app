import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  updateFieldSuggestions,
  formFields,
  getDefaultStartTime,
  getDefaultEndTime,
  parseExistingRescue,
} from './utils'
import UserIcon from 'assets/user.svg'
import {
  createTimestamp,
  deleteFirestoreData,
  generateDirectionsLink,
  generateUniqueId,
  STATUSES,
  updateGoogleCalendarEvent,
  SE_API,
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
import { useApi, useFirestore, useAuth } from 'hooks'
import {
  Button,
  Spacer,
  Text,
  ExternalLink,
  Card,
} from '@sharingexcess/designsystem'
import { Emoji } from 'react-apple-emojis'

export function EditRescue() {
  const { user, admin } = useAuth()
  const { rescue_id } = useParams()
  const navigate = useNavigate()
  const { data: rescue } = useApi(rescue_id ? `/rescues/${rescue_id}` : null)
  const handlers = useFirestore('users')
  const [formData, setFormData] = useState({
    // Any field used as an input value must be an empty string
    // others can and should be initialized as null
    handler_name: '',
    handler_id: null,
    timestamp_scheduled_start: getDefaultStartTime(),
    timestamp_scheduled_finish: getDefaultEndTime(),
    type: 'retail',
    is_direct_link: false,
    stops: [],
  })
  const [suggestions, setSuggestions] = useState({
    // these will populate the dropdown suggestions for each input
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
    async function getExistingRescueData() {
      const existingRescueData = await parseExistingRescue(rescue)
      setFormData(prevFormData => ({
        ...prevFormData,
        ...existingRescueData,
      }))
      setSuggestions(prevSuggestions => ({
        ...prevSuggestions,
        handler_name: null,
      }))
      setCanRender(true)
    }
    rescue && rescue_id && getExistingRescueData()
  }, [rescue, rescue_id])

  useEffect(() => {
    formData.handler_id &&
      setFormData({
        ...formData,
        handler: handlers.find(i => i.id === formData.handler_id),
      })
  }, [formData.handler_id, handlers]) // eslint-disable-line

  function deselectStop(e) {
    if (e.target.id === 'EditRescue') {
      setSelectedCardId(null)
    }
  }

  async function handleAddPickup(pickup) {
    setList()
    setFormData({
      ...formData,
      stops: [...formData.stops, pickup],
    })
  }

  async function handleAddDelivery(delivery) {
    setList()
    setFormData({
      ...formData,
      stops: [...formData.stops, delivery],
    })
  }

  async function handleCreateRescue() {
    setWorking(true)
    const new_rescue_id = rescue_id || (await generateUniqueId('rescues'))
    if (rescue_id) {
      // if this is an existing rescue with pre-created stops,
      // make sure we delete any old and now deleted pickups and deliveries
      for (const stop of deletedStops) {
        await deleteFirestoreData(['stops', stop.id])
      }
    }

    await SE_API.post(`/rescues/${new_rescue_id}/create`, {
      formData: formData,
      status_scheduled: rescue?.status ? rescue.status : STATUSES.SCHEDULED,
      timestamp_created: rescue?.timestamp_created
        ? rescue.timestamp_created
        : createTimestamp(),
      timestamp_scheduled_start: moment(
        formData.timestamp_scheduled_start
      ).toDate(),
      timestamp_scheduled_finish: moment(
        formData.timestamp_scheduled_finish
      ).toDate(),
      timestamp_updated: createTimestamp(),
    })

    setWorking(false)
    navigate(`/rescues/${new_rescue_id}`)
  }

  ///This is a function to call when we want to update a rescue rather than calling handleCreateRescue
  async function handleUpdateRescue() {
    setWorking(true)
    const new_rescue_id = rescue_id || (await generateUniqueId('rescues'))
    if (rescue_id) {
      // if this is an existing rescue with pre-created stops,
      // make sure we delete any old and now deleted pickups and deliveries
      for (const stop of deletedStops) {
        await deleteFirestoreData(['stops', stop.id])
      }
    }

    await SE_API.post(`/rescues/${rescue.id}/update`, {
      timestamp_updated: createTimestamp(),
      handler_id: formData.handler_id,
      stops: formData.stops,
      timestamp_scheduled_start: formData.timestamp_scheduled_finish,
      timestamp_scheduled_finish: formData.timestamp_scheduled_finish,
    })

    for (const stop of formData.stops) {
      SE_API.post(`/stops/${stop.id}/update`, {
        ...stop,
        rescue_id: rescue_id,
        timestamp_updated: createTimestamp(),
        handler_id: formData.handler_id,
        timestamp_scheduled_start: formData.timestamp_scheduled_finish,
        timestamp_scheduled_finish: formData.timestamp_scheduled_finish,
      })
    }

    setWorking(false)
    navigate(`/rescues/${new_rescue_id}`)
  }

  async function handleRemoveStop(id, type) {
    setFormData({
      ...formData,
      stops: formData.stops.filter(s => s.id !== id),
    })
    setDeletedStops(currDeletedStops => [...currDeletedStops, { id, type }])
  }

  function isValidRescue() {
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
        handlers,
        field,
        suggestions,
        setSuggestions
      )
    }
    if (field.id === 'timestamp_scheduled_start') {
      // automatically set time end 2 hrs later
      const timestamp_scheduled_finish = new Date(e.target.value)
      timestamp_scheduled_finish.setTime(
        timestamp_scheduled_finish.getTime() + 2 * 60 * 60 * 1000
      )
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
        timestamp_scheduled_finish: moment(timestamp_scheduled_finish).format(
          'yyyy-MM-DDTHH:mm'
        ),
      })
    } else if (field.id === 'handler_name') {
      setFormData({
        ...formData,
        handler: {},
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
      return `${s.organization.name} (${
        s.location.nickname || s.location.address1
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
            classList={['Rescue-stop-address-button']}
            type="tertiary"
            size="small"
            color="blue"
          >
            <Emoji name="round-pushpin" width={20} />
            <Spacer width={8} />
            {s.location.address1}
            {s.location.address2 && ` - ${s.location.address2}`}
            <br />
            {s.location.city}, {s.location.state} {s.location.zip}
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
          {admin && (
            <i
              className="fa fa-times"
              onClick={() => handleRemoveStop(s.id, s.type)}
            />
          )}
          <Text
            type="small-header"
            color={s.type === 'pickup' ? 'green' : 'red'}
          >
            {s.type === 'pickup' ? 'PICKUP' : 'DELIVERY'}
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
    if (!moment(formData.timestamp_scheduled_start).isValid()) {
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

  function Handler() {
    return (
      <div id="EditRescue-handler">
        <img
          src={formData.handler ? formData.handler.icon : UserIcon}
          alt={formData.handler ? formData.handler.name : 'Unassigned Rescue'}
        />
        <div id="EditRescue-handler-info">
          <Text type="secondary-header" color="white" shadow>
            {formData.handler ? formData.handler.name : 'Unassigned Rescue'}
          </Text>
          <Text type="subheader" color="white" shadow>
            {`${moment(formData.timestamp_scheduled_start).format(
              'ddd, MMM D, h:mma'
            )}${
              formData.timestamp_scheduled_finish
                ? ' - ' +
                  moment(formData.timestamp_scheduled_finish).format('h:mma')
                : ''
            } `}
          </Text>
          <Spacer height={8} />
          {admin ? (
            <Button
              id="EditRescue-handler-edit"
              type="secondary"
              handler={() => setConfirmedTime(false)}
            >
              Update Rescue Info
            </Button>
          ) : (
            <Text color="white" shadow>
              Select a stop to reorder your rescue
            </Text>
          )}
        </div>
      </div>
    )
  }

  function SelectHandler() {
    function ConfirmTimesButton() {
      function handleClick() {
        if (validateFormData()) {
          setConfirmedTime(true)
        } else setShowErrors(true)
      }

      return (
        formData.timestamp_scheduled_start &&
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
      function generateSubmitButtonText() {
        return working ? (
          <>
            {rescue_id ? 'Updating Rescue' : 'Creating Rescue'}
            <Ellipsis />
          </>
        ) : rescue_id ? (
          'Update Rescue'
        ) : (
          'Create Rescue'
        )
      }

      return isValidRescue() && !list ? (
        <Button
          id="EditRescue-submit"
          size="large"
          type="secondary"
          disabled={working}
          handler={rescue_id ? handleUpdateRescue : handleCreateRescue}
        >
          {generateSubmitButtonText()}
        </Button>
      ) : null
    }

    function getPosition(id) {
      return formData.stops.findIndex(i => i.id === id)
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
          {admin && (
            <>
              <CancelButton />
              <AddPickupButton />
              <AddDeliveryButton />
            </>
          )}
          <SubmitButton />
        </div>
      </>
    ) : null
  }

  return (
    <main id="EditRescue" onClick={deselectStop}>
      {canRender ? (
        <>
          {confirmedTimes ? <Handler /> : SelectHandler()}
          <SelectStops />
        </>
      ) : (
        <Loading />
      )}
    </main>
  )
}
