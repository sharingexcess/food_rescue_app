import React, { useState, useEffect } from 'react'
import {
  Button,
  Card,
  ExternalLink,
  Image,
  Spacer,
  Text,
} from '@sharingexcess/designsystem'

import moment from 'moment'
import { EditDelivery, GoogleMap, Input } from 'components'
import {
  DAYS,
  CLOUD_FUNCTION_URLS,
  createTimestamp,
  formatPhoneNumber,
  setFirestoreData,
  getFirestoreData,
  updateGoogleCalendarEvent,
  generateDirectionsLink,
  STATUSES,
  FOOD_CATEGORIES,
  RECIPIENT_TYPES,
  generateUniqueId,
  formatTimestamp,
  API_URL,
  SE_API,
} from 'helpers'
import { useAuth, useFirestore, useApp } from 'hooks'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { areAllStopsCompleted, getNextIncompleteStopIndex } from './utils'
import UserIcon from 'assets/user.svg'
import { Emoji } from 'react-apple-emojis'
import PickupIcon from 'assets/pickup.png'
import DeliveryIcon from 'assets/delivery.png'

export function RescueHeader({ rescue, refresh }) {
  const { setModal, setModalState } = useApp()

  function openRescueMenu() {
    setModal('RescueMenu')
    setModalState({ rescue, refresh })
  }

  return rescue ? (
    <div id="Driver" type="secondary">
      <Image
        src={rescue.handler ? rescue.handler.icon : UserIcon}
        alt={rescue.handler ? rescue.handler.name : 'No assigned driver'}
      />
      <div>
        <Text type="small-header" color="white" shadow>
          {rescue.status.toUpperCase()} RESCUE
        </Text>
        <Text type="section-header" color="white" shadow>
          {rescue.handler ? rescue.handler.name : 'No assigned driver'}
        </Text>
        <Text type="small" color="white" shadow>
          {formatTimestamp(
            rescue.timestamp_scheduled_start,
            'ddd, MMM D, h:mma '
          )}
          {rescue.timestamp_scheduled_finish &&
            formatTimestamp(rescue.timestamp_scheduled_finish, ' - h:mma ')}
        </Text>
        {rescue.notes ? (
          <Text type="small" color="white" shadow>
            Notes: {rescue.notes}
          </Text>
        ) : null}
      </div>
      <Button
        id="Rescue-edit-button"
        type="secondary"
        color="white"
        handler={openRescueMenu}
      >
        <i className="fa fa-ellipsis-v" />
      </Button>
    </div>
  ) : null
}

export function RescueMenu({ refresh }) {
  const { setModal, modalState, setModalState } = useApp()
  const { user, admin } = useAuth()
  const { rescue_id } = useParams()
  const { rescue } = modalState

  function RescueOption({ label, action }) {
    return (
      <Button type="tertiary" color="blue" size="large" handler={action}>
        {label}
      </Button>
    )
  }

  return rescue ? (
    <div id="RescueMenu">
      <Text type="secondary-header" color="black">
        Rescue Options
      </Text>
      <Spacer height={8} />
      <ul>
        <li>
          <RescueOption
            action={() => setModal('AddRescueNotes')}
            label="Add Notes to Rescue"
          />
        </li>
        {user.id === rescue.handler_id || admin ? (
          <li>
            <RescueOption
              action={() => setModal('FinishRescue')}
              label="Force Finish Rescue"
            />
          </li>
        ) : null}

        {user.id === rescue.handler_id ? (
          <>
            <li>
              <RescueOption
                action={() => setModal('DropRescue')}
                label="Drop Rescue"
              />
            </li>
            <li>
              <RescueOption
                action={() => setModal('ContactAdmin')}
                label="Contact Admin"
              />
            </li>
          </>
        ) : null}
        {admin ? (
          <>
            <li>
              <Link to={`/rescues/${rescue_id}/edit`}>
                <Button type="tertiary" color="blue" size="large">
                  Edit Rescue
                </Button>
              </Link>
            </li>
            <li>
              <RescueOption
                action={() => setModal('CancelRescue')}
                label="Cancel Rescue"
              />
            </li>
          </>
        ) : null}
      </ul>
    </div>
  ) : null
}

export function StopMenu() {
  const { setModal, modalState } = useApp()

  return (
    <div id="StopMenu">
      <Text type="secondary-header" color="black">
        {modalState.stop.type} Options
      </Text>
      <Spacer height={8} />
      <ul>
        <li>
          <Button
            type="tertiary"
            color="blue"
            size="large"
            handler={() => setModal('CancelStop')}
          >
            Cancel {modalState.stop.type}
          </Button>
        </li>
      </ul>
    </div>
  )
}

export function DropRescue() {
  const { setModal, modalState } = useApp()
  const [notes, setNotes] = useState('')
  const { rescue } = modalState
  const { user } = useAuth()

  async function handleUnassign() {
    const event = await updateGoogleCalendarEvent(
      {
        ...rescue,
        driver: null,
        notes: `Rescue dropped by ${rescue.handler.name}: "${notes}"`,
      },
      user.accessToken
    )
    await setFirestoreData(['rescues', rescue.id], {
      handler_id: null,
      google_calendar_event_id: event.id,
      notes: `Rescue dropped by ${rescue.handler.name}: "${notes}"`,
      timestamp_updated: createTimestamp(),
    })
    for (const stop of rescue.stops) {
      setFirestoreData(['stops', stop.id], {
        handler_id: null,
        timestamp_updated: createTimestamp(),
      })
    }
    setModal()
  }

  return (
    <>
      <Text type="secondary-header" color="black">
        Drop Rescue
      </Text>
      <Spacer height={4} />
      <Button
        type="tertiary"
        color="blue"
        handler={() => setModal('RescueMenu')}
      >
        &lt; Back to Rescue Options
      </Button>
      <Input
        label="Why can't you complete this rescue?"
        animation={false}
        type="textarea"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <Button
        type="primary"
        color="green"
        size="large"
        fullWidth
        handler={handleUnassign}
      >
        Confirm Drop Rescue
      </Button>
    </>
  )
}

export function CancelRescue() {
  const { modalState, setModal } = useApp()
  const [notes, setNotes] = useState()
  const { rescue } = modalState
  async function handleCancel() {
    await SE_API.post(`/rescues/${rescue.id}/cancel`, {
      status: STATUSES.CANCELLED,
      notes: notes ? notes : '',
      stop_ids: rescue.stop_ids,
    })

    rescue.stop_ids.forEach(async stop_id => {
      const stop = await getFirestoreData(['stops', stop_id])

      await SE_API.post(
        `/rescues/${rescue.id}/${stop.type}/${stop_id}/cancel`,
        {
          status: STATUSES.CANCELLED,
          notes: notes ? notes : '',
        }
      )
    })

    await fetch(CLOUD_FUNCTION_URLS.deleteCalendarEvent, {
      method: 'POST',
      body: JSON.stringify({
        calendarId: process.env.REACT_APP_GOOGLE_CALENDAR_ID,
        eventId: rescue.google_calendar_event_id,
      }),
    })

    // bad practice
    modalState.refresh()
  }

  return (
    <>
      <Text type="secondary-header" color="black">
        Cancel Rescue
      </Text>
      <Spacer height={4} />
      <Button
        type="tertiary"
        color="blue"
        handler={() => setModal('RescueMenu')}
      >
        &lt; Back to Rescue Options
      </Button>
      <Input
        label="Why can't you complete this rescue?"
        animation={false}
        type="textarea"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <Button
        type="primary"
        color="green"
        size="large"
        fullWidth
        handler={handleCancel}
      >
        Confirm Cancel Rescue
      </Button>
    </>
  )
}

export function FinishRescue() {
  const { setModal, modalState } = useApp()
  const [notes, setNotes] = useState('')
  const navigate = useNavigate()
  const { rescue_id } = useParams()
  const { rescue } = modalState

  async function handleFinish() {
    await setFirestoreData(['rescues', rescue.id], {
      status: STATUSES.COMPLETED,
      notes,
    })
    setModal()
    navigate(`/rescues/${rescue_id}/completed`)
  }

  return (
    <>
      <Text type="secondary-header" color="black">
        Finish Rescue
      </Text>
      <Spacer height={4} />
      <Button
        type="tertiary"
        color="blue"
        handler={() => setModal('RescueMenu')}
      >
        &lt; Back to Rescue Options
      </Button>
      <Input
        label="Rescue notes..."
        animation={false}
        type="textarea"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <Button
        type="primary"
        color="green"
        size="large"
        fullWidth
        handler={handleFinish}
      >
        Confirm Finish Rescue
      </Button>
    </>
  )
}

export function AddRescueNotes() {
  const { setModal, modalState } = useApp()
  const { rescue } = modalState
  const [notes, setNotes] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (rescue && rescue.notes) {
      setNotes(rescue.notes)
    }
  }, [rescue])

  async function handleAddNotes() {
    await setFirestoreData(['rescues', rescue.id], {
      notes,
    })
    navigate(location.pathname)
    setModal()
  }

  return (
    <>
      <Text type="secondary-header" color="black">
        Add Notes
      </Text>
      <Spacer height={4} />
      <Button
        type="tertiary"
        color="blue"
        handler={() => setModal('RescueMenu')}
      >
        &lt; Back to Rescue Options
      </Button>
      <Input
        label="Rescue notes..."
        animation={false}
        type="textarea"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <Button
        type="primary"
        color="green"
        size="large"
        fullWidth
        handler={handleAddNotes}
      >
        Submit
      </Button>
    </>
  )
}

export function CancelStop() {
  const [notes, setNotes] = useState('')
  const { setModal, modalState } = useApp()

  async function handleCancel() {
    const payload = {
      status: STATUSES.CANCELLED,
      notes,
      impact_data_dairy: 0,
      impact_data_bakery: 0,
      impact_data_produce: 0,
      impact_data_meat_fish: 0,
      impact_data_non_perishable: 0,
      impact_data_prepared_frozen: 0,
      impact_data_mixed: 0,
      impact_data_other: 0,
      impact_data_total_weight: 0,
    }
    if (modalState.stop.type === 'delivery') {
      payload.percent_of_total_dropped = 0
    }
    await setFirestoreData(['stops', modalState.stop.id], payload)

    setModal()
  }

  return (
    <>
      <Text type="secondary-header" color="black">
        Cancel Stop
      </Text>
      <Spacer height={4} />
      <Input
        label="Why are you cancelling this stop?"
        animation={false}
        type="textarea"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <Button
        type="primary"
        color="green"
        size="large"
        fullWidth
        handler={handleCancel}
      >
        Confirm Cancel Stop
      </Button>
    </>
  )
}

export function ContactAdmin() {
  const { setModal } = useApp()

  return (
    <div id="ContactAdmin">
      <Text type="section-header">Need Help?</Text>
      <Spacer height={4} />
      <Button
        type="tertiary"
        color="blue"
        handler={() => setModal('RescueMenu')}
      >
        &lt; Back to Rescue Options
      </Button>
      <Spacer height={16} />
      <Text type="paragraph">No stress! Call Hannah for backup.</Text>
      <Spacer height={16} />
      <ExternalLink to="tel:83374727397" fullWidth>
        <Button type="primary" color="green" size="large" fullWidth>
          Call Now
        </Button>
      </ExternalLink>
    </div>
  )
}

export function Stop({ rescue, stops, s, i }) {
  const navigate = useNavigate()
  const { rescue_id } = useParams()
  const { setModal, setModalState } = useApp()

  const isActiveStop = rescue
    ? i === getNextIncompleteStopIndex(rescue, stops)
    : false
  const isCompletedStop = [STATUSES.COMPLETED, STATUSES.CANCELLED].includes(
    s.status
  )

  function RescueStatusIndicator({ rescue }) {
    if (rescue.status === STATUSES.COMPLETED) {
      return (
        <div className="Rescues-stop-status">
          <Emoji name="check-mark-button" width={20} />
        </div>
      )
    } else if (rescue.status === STATUSES.CANCELLED) {
      return (
        <div className="Rescues-stop-status">
          <Emoji name="cross-mark" width={20} />
        </div>
      )
    } else if (rescue.status === STATUSES.SCHEDULED) {
      return (
        <div className="Rescues-stop-status">
          <Emoji name="spiral-calendar" width={20} />
        </div>
      )
    } else if (rescue.status === STATUSES.ACTIVE) {
      return (
        <div className="Rescues-stop-status">
          <Emoji name="articulated-lorry" width={20} />
        </div>
      )
    } else return null
  }

  function StopHeader() {
    return (
      <div className="Rescue-stop-header">
        <Text
          type="small-header"
          color={
            isActiveStop ? (s.type === 'pickup' ? 'green' : 'red') : 'white'
          }
        >
          {s.type === 'delivery' ? (
            <>
              <Image src={DeliveryIcon} />
              DELIVERY
            </>
          ) : (
            <>
              <Image src={PickupIcon} />
              PICKUP
            </>
          )}
        </Text>
        {!isCompletedStop && (
          <Button
            id="Rescue-stop-edit-button"
            type="tertiary"
            size="large"
            color={isActiveStop ? 'black' : 'white'}
            handler={() => {
              setModalState(state => ({ ...state, stop: s }))
              setModal('StopMenu')
            }}
          >
            <i className="fa fa-ellipsis-v" />
          </Button>
        )}
        <RescueStatusIndicator rescue={s} />
      </div>
    )
  }

  function StopInstructions() {
    return s.location.notes ? (
      <>
        <Spacer height={16} />
        <Text
          type="small"
          color={isActiveStop ? 'black' : 'white'}
          classList={['Rescue-stop-instructions']}
        >
          <span>Instructions: </span>
          {s.location.notes}
        </Text>
      </>
    ) : null
  }

  function formatTime(time) {
    const getHour = parseInt(time) >= 12 ? time.slice(0, 2) : time.slice(0, 1)
    const getMin = time.slice(-2)
    const amOrPm = getHour >= 12 ? 'pm' : 'am'
    if (getHour > 12) {
      return [getHour - 12, ':', getMin, amOrPm]
    } else return [time, amOrPm]
  }

  function GetDayOfWeek() {
    const formatDate = formatTimestamp(s.timestamp_scheduled_start)
    const date = moment(formatDate).format('d')
    const filterDate = s.location.hours
      ? s.location.hours.filter(hour => hour.day_of_week === parseInt(date))
      : null

    return filterDate.length > 0
      ? [
          ' Open ',
          DAYS[filterDate[0].day_of_week],
          ' : ',
          formatTime(filterDate[0].time_open),
          ' - ',
          formatTime(filterDate[0].time_close),
        ]
      : ' No hours available'
  }

  function StopHours() {
    return s.location.hours ? (
      <>
        <Spacer height={16} />
        <Text type="small" color={isActiveStop ? 'black' : 'white'}>
          <Emoji name="one-oclock" width={20} />

          {GetDayOfWeek()}
        </Text>
      </>
    ) : null
  }

  function StopAddress() {
    const { address1, address2, city, state, zip } = s.location
    const button = (
      <Button
        classList={['Rescue-stop-address-button']}
        type="tertiary"
        size="small"
        color={'blue'}
      >
        <Emoji name="round-pushpin" width={20} />
        <Spacer width={8} />
        {address1}
        {address2 && ` - ${address2}`}
        <br />
        {city}, {state} {zip}
      </Button>
    )

    return s.status && s.status !== STATUSES.COMPLETED ? (
      <ExternalLink
        to={generateDirectionsLink(
          s.location.address1,
          s.location.city,
          s.location.state,
          s.location.zip
        )}
      >
        {button}
      </ExternalLink>
    ) : (
      button
    )
  }

  function StopContact({ name, number }) {
    return (
      <ExternalLink to={number ? `tel:${number}` : null}>
        <Button
          classList={['Rescue-stop-phone-button']}
          type="tertiary"
          size="small"
          color="blue"
        >
          <Emoji name="telephone-receiver" width={20} />
          <Spacer width={8} />
          {number ? formatPhoneNumber(number) : 'No Phone Number'}
          {name && ` (ask for ${name})`}
        </Button>
      </ExternalLink>
    )
  }

  function StopMap() {
    return s.location.lat && s.location.lng ? (
      <GoogleMap address={s.location} style={{ height: 200 }} zoom={14} />
    ) : null
  }

  function StopDirectionsButton() {
    async function handleClick() {
      await setFirestoreData(['stops', s.id], {
        status: STATUSES.ACTIVE,
        timestamp_logged_start: createTimestamp(),
      })
      navigate(location.pathname)
    }
    async function handleSkip() {
      if (s.organization.subtype === RECIPIENT_TYPES.HOME_DELIVERY) {
        handleSubmitHomeDelivery()
      } else {
        setFirestoreData(['stops', s.id], {
          status: STATUSES.ACTIVE,
          timestamp_logged_start: createTimestamp(),
        }).then(() => navigate(`/rescues/${rescue_id}/${s.type}/${s.id}`))
      }
    }

    return (
      <>
        <ExternalLink
          id="Rescue-directions-button-link"
          to={generateDirectionsLink(
            s.location.address1,
            s.location.city,
            s.location.state,
            s.location.zip
          )}
        >
          <Button
            type="primary"
            color="blue"
            size="large"
            fullWidth
            handler={handleClick}
          >
            Get Directions
          </Button>
        </ExternalLink>
        <Spacer height={24} />
        <Button
          type="tertiary"
          color="blue"
          size="medium"
          fullWidth
          handler={handleSkip}
        >
          Skip to Enter {s.type} Weight
        </Button>
        <Spacer height={8} />
      </>
    )
  }

  function handleSubmitHomeDelivery() {
    // BAKED IN ASSUMPTION: home delivery rescues will only ever have 1 pickup
    const pickup = rescue.stops.find(s => s.type === 'pickup')
    const percent_of_total_dropped = 1 / (rescue.stops.length - 1)
    setFirestoreData(['stops', s.id], {
      // calculate percentage based weight totals for each food category
      // ...FOOD_CATEGORIES.reduce((acc, curr) => ((acc[curr] = 0), acc), {})
      ...FOOD_CATEGORIES.reduce(
        (acc, curr) => (
          (acc[curr] = Math.round(pickup[curr] * percent_of_total_dropped)), acc // eslint-disable-line
        ),
        {}
      ),
      percent_of_total_dropped: Math.round(percent_of_total_dropped * 100),
      impact_data_total_weight:
        Math.round(
          pickup.impact_data_total_weight * percent_of_total_dropped
        ) || 0,
      timestamp_logged_start: createTimestamp(),
      timestamp_updated: createTimestamp(),
      timestamp_logged_finish: createTimestamp(),
      status: STATUSES.COMPLETED,
    })
      .then(() => navigate(`/rescues/${rescue_id}`))
      .catch(e => console.error('Error writing document: ', e))
  }

  function StopReportButton() {
    function handleOpenReport() {
      setFirestoreData(['stops', s.id], {
        status: STATUSES.ACTIVE,
      }).then(() => navigate(`/rescues/${rescue_id}/${s.type}/${s.id}`))
    }

    function handleClick() {
      if (
        s.type === 'delivery' &&
        s.organization.subtype === RECIPIENT_TYPES.HOME_DELIVERY
      ) {
        handleSubmitHomeDelivery()
      } else handleOpenReport()
    }

    return (
      <Button
        type="primary"
        color="blue"
        size="large"
        fullWidth
        handler={handleClick}
      >
        Enter {s.type} Weight
      </Button>
    )
  }

  function StopDetails() {
    return s.location.is_deleted ? (
      <Text type="paragraph">This location has been deleted.</Text>
    ) : (
      <>
        <Spacer height={16} />
        <StopAddress />
        <Spacer height={8} />
        <StopContact
          name={s.location.contact_name}
          number={s.location.contact_phone}
        />
        <StopHours />
        <StopInstructions />
        <Spacer height={16} />
        <StopMap />
        <Spacer height={24} />
        {s.status === STATUSES.SCHEDULED && <StopDirectionsButton />}
        {s.status === STATUSES.ACTIVE && <StopReportButton />}
      </>
    )
  }

  function StopSummary() {
    return (
      <>
        <Spacer height={8} />
        <StopAddress />
        <Spacer height={8} />
        <Text classList={['StopSummary-notes']} type="small" color="white">
          <Emoji name="pencil" width={20} />
          <Spacer width={8} />
          {s.status === 'completed' &&
            s.impact_data_total_weight +
              ' lbs. ' +
              (s.type === 'pickup' ? 'rescued' : 'delivered')}
          {s.notes && `\n"${s.notes}"`}
        </Text>
      </>
    )
  }

  function linkToReport(children) {
    return (
      <Link
        style={{ width: '100%' }}
        to={`/rescues/${rescue_id}/${s.type}/${s.id}`}
      >
        {children}
      </Link>
    )
  }

  const stopCard = (
    <Card
      type={isActiveStop ? 'primary' : 'secondary'}
      classList={['Stop']}
      key={i}
    >
      <StopHeader />
      <Spacer height={4} />
      <Text
        type="section-header"
        color={isActiveStop ? 'black' : 'white'}
        shadow={!isActiveStop}
      >
        {s.organization.name}
        {s.location.nickname ? ` (${s.location.nickname})` : ''}
      </Text>
      {isActiveStop ? (
        <StopDetails />
      ) : isCompletedStop ? (
        <StopSummary />
      ) : (
        <>
          <Spacer height={8} />
          <StopAddress />
          <Spacer height={8} />
          <StopContact
            name={s.location.contact_name}
            number={s.location.contact_phone}
          />
          <Spacer height={8} />
          <StopHours />
          <StopInstructions />
        </>
      )}
    </Card>
  )

  return s.status === STATUSES.COMPLETED ||
    (rescue && rescue.status === STATUSES.COMPLETED)
    ? linkToReport(stopCard)
    : stopCard
}

export function RescueActionButton({ rescue }) {
  const { rescue_id } = useParams()
  const drivers = useFirestore('users')
  const { user, admin } = useAuth()
  const navigate = useNavigate()

  async function handleBegin() {
    await SE_API.post(`/rescues/${rescue.id}/update`, {
      status: STATUSES.ACTIVE,
      timestamp_logged_start: createTimestamp(),
      timestamp_updated: createTimestamp(),
    })
    navigate(location.pathname)
  }

  async function handleClaim() {
    // const event = await updateGoogleCalendarEvent(
    //   {
    //     ...rescue,
    //     notes: null,
    //     driver: drivers.find(d => d.id === user.uid),
    //   },
    //   user.accessToken
    // )
    // setFirestoreData(['rescues', rescue.id], {
    //   handler_id: user.uid,
    //   google_calendar_event_id: event.id,
    //   notes: '',
    //   timestamp_updated: createTimestamp(),
    // })
    // for (const stop of rescue.stops) {
    //   setFirestoreData(['stops', stop.id], {
    //     handler_id: user.uid,
    //   })
    // }

    await SE_API.post(`/rescues/${rescue_id}/update`, {
      handler_id: user.uid,
      // create event in api
      notes: '',
      timestamp_updated: createTimestamp(),
    })
    const stops_promises = []
    for (const stop of rescue.stops) {
      stops_promises.push(
        SE_API.post(`/stops/${stop.id}/update`, {
          handler_id: user.uid,
          timestamp_updated: createTimestamp(),
        })
      )
    }
    await Promise.all(stops_promises)
  }

  function ActionButton({ handler, link, children }) {
    const button = (
      <Button
        type="primary"
        size="large"
        color="white"
        fullWidth
        handler={handler}
      >
        {children}
      </Button>
    )
    return link ? (
      <Link to={link} style={{ width: '100%' }}>
        {button}
      </Link>
    ) : (
      button
    )
  }
  if (!rescue) return null
  if (rescue.status === STATUSES.SCHEDULED) {
    if (rescue.handler) {
      return <ActionButton handler={handleBegin}>Start Rescue</ActionButton>
    } else {
      if (admin) {
        return (
          <ActionButton link={`/rescues/${rescue_id}/edit`}>
            Assign Driver
          </ActionButton>
        )
      } else
        return <ActionButton handler={handleClaim}>Claim Rescue</ActionButton>
    }
  }
  return null
}

export function BackupDelivery({ rescue }) {
  const [willFind, setWillFind] = useState()
  const [working, setWorking] = useState(false)
  const { rescue_id } = useParams()

  if (rescue && areAllStopsCompleted(rescue.stops)) {
    let lastStop
    for (const s of rescue.stops) {
      if (
        s.status === STATUSES.COMPLETED &&
        (!lastStop ||
          s.timestamp_logged_finish > lastStop.timestamp_logged_finish)
      )
        lastStop = s
    }
    if (
      lastStop &&
      (!lastStop.impact_data_total_weight ||
        lastStop.percent_of_total_dropped < 100 ||
        lastStop.type === 'pickup')
    ) {
      async function addBackupDelivery(stop) {
        if (!working) {
          setWorking(true)
          const stop_id = await generateUniqueId('stops')
          await setFirestoreData(['stops', stop_id], {
            id: stop_id,
            type: 'delivery',
            organization_id: stop.organization_id,
            location_id: stop.location_id,
            handler_id: rescue.handler_id,
            timestamp_created: createTimestamp(),
            timestamp_updated: createTimestamp(),
            timestamp_scheduled_start: rescue.timestamp_scheduled_start,
            timestamp_scheduled_finish: rescue.timestamp_scheduled_finish,
            timestamp_logged_start: null,
            timestamp_logged_finish: null,
            status: STATUSES.SCHEDULED,
            rescue_id,
            impact_data_dairy: 0,
            impact_data_bakery: 0,
            impact_data_produce: 0,
            impact_data_meat_fish: 0,
            impact_data_non_perishable: 0,
            impact_data_prepared_frozen: 0,
            impact_data_mixed: 0,
            impact_data_other: 0,
            impact_data_total_weight: 0,
            percent_of_total_dropped: 100,
          })
          await setFirestoreData(['rescues', rescue_id], {
            stop_ids: [...rescue.stops.map(s => s.id), stop_id],
            timestamp_updated: createTimestamp(),
          })
          setWorking(false)
        }
      }
      return (
        <div id="BackupDelivery">
          {willFind ? (
            <>
              <EditDelivery handleSubmit={addBackupDelivery} />
              <br />
              <Button handler={() => setWillFind(false)}>cancel</Button>
            </>
          ) : (
            <>
              <Text type="section-header" color="white" shadow align="center">
                Looks like you have left over food!
              </Text>
              <Text type="paragraph" color="white" shadow align="center">
                Add another delivery location to finish your rescue.
              </Text>
              <Button handler={() => setWillFind(true)}>
                Add Another Delivery
              </Button>
            </>
          )}
        </div>
      )
    }
  }
  return null
}
