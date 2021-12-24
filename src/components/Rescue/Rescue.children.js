import React, { useState } from 'react'
import {
  Button,
  Card,
  ExternalLink,
  Image,
  Spacer,
  Text,
} from '@sharingexcess/designsystem'
import { EditDelivery, GoogleMap, Input } from 'components'
import {
  CLOUD_FUNCTION_URLS,
  createTimestamp,
  formatPhoneNumber,
  generateStopId,
  getCollection,
  setFirestoreData,
  updateGoogleCalendarEvent,
  generateDirectionsLink,
  STATUSES,
  FOOD_CATEGORIES,
  RECIPIENT_TYPES,
} from 'helpers'
import { useAuth, useFirestore, useApp } from 'hooks'
import { Link, useHistory, useParams } from 'react-router-dom'
import { areAllStopsCompleted, getNextIncompleteStopIndex } from './utils'
import UserIcon from 'assets/user.svg'
import moment from 'moment'

export function RescueHeader() {
  const { setModal } = useApp()
  const { rescue_id } = useParams()
  const rescue = useFirestore('rescues', rescue_id)

  return rescue ? (
    <div id="Driver" type="secondary">
      <Image
        src={rescue.driver ? rescue.driver.icon : UserIcon}
        alt={rescue.driver ? rescue.driver.name : 'No assigned driver'}
      />
      <div>
        <Text type="small-header" color="white" shadow>
          {rescue.status.toUpperCase()} RESCUE
        </Text>
        <Text type="section-header" color="white" shadow>
          {rescue.driver ? rescue.driver.name : 'No assigned driver'}
        </Text>
        <Text type="small" color="white" shadow>
          {moment(rescue.timestamp_scheduled_start).format('ddd, MMM D, h:mma')}{' '}
          ({rescue.stops.length} total stops)
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
        handler={() => setModal('RescueMenu')}
      >
        <i className="fa fa-ellipsis-v" />
      </Button>
    </div>
  ) : null
}

export function RescueMenu() {
  const { setModal } = useApp()
  const { user, admin } = useAuth()
  const { rescue_id } = useParams()
  const rescue = useFirestore('rescues', rescue_id)

  function RescueOption({ name, modalName }) {
    return (
      <Button
        type="tertiary"
        color="blue"
        size="large"
        handler={() => setModal(modalName)}
      >
        {name}
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
        {user.id === rescue.handler_id || admin ? (
          <>
            <li>
              <RescueOption
                modalName="FinishRescue"
                name="Force Finish Rescue"
              />
            </li>
          </>
        ) : null}

        {user.id === rescue.handler_id ? (
          <>
            <li>
              <RescueOption modalName="DropRescue" name="Drop Rescue" />
            </li>
            <li>
              <RescueOption modalName="ContactAdmin" name="Contact Admin" />
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
              <RescueOption modalName="CancelRescue" name="Cancel Rescue" />
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
  const { setModal } = useApp()
  const [notes, setNotes] = useState('')
  const { rescue_id } = useParams()
  const rescue = useFirestore('rescues', rescue_id)

  async function handleUnassign() {
    const event = await updateGoogleCalendarEvent({
      ...rescue,
      driver: null,
      notes: `Rescue dropped by ${rescue.driver.name}: "${notes}"`,
    })
    await setFirestoreData(['rescues', rescue.id], {
      handler_id: null,
      google_calendar_event_id: event.id,
      notes: `Rescue dropped by ${rescue.driver.name}: "${notes}"`,
      timestamp_updated: createTimestamp(),
    })
    for (const stop of rescue.stops) {
      const collection = stop.type === 'pickup' ? 'pickups' : 'deliveries'
      setFirestoreData([collection, stop.id], {
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
  const { setModal } = useApp()
  const [notes, setNotes] = useState()
  const { rescue_id } = useParams()
  const rescue = useFirestore('rescues', rescue_id)

  async function handleCancel() {
    getCollection('rescues')
      .doc(rescue.id)
      .set({ status: STATUSES.CANCELLED, notes }, { merge: true })
      .then(() => {
        fetch(CLOUD_FUNCTION_URLS.deleteCalendarEvent, {
          method: 'POST',
          body: JSON.stringify({
            calendarId: process.env.REACT_APP_GOOGLE_CALENDAR_ID,
            eventId: rescue.google_calendar_event_id,
          }),
        }).catch(e => console.error('Error deleting calendar event:', e))
      })
      .then(() => setModal())
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
  const { setModal } = useApp()
  const [notes, setNotes] = useState('')
  const history = useHistory()
  const { rescue_id } = useParams()
  const rescue = useFirestore('rescues', rescue_id)

  async function handleFinish() {
    getCollection('rescues')
      .doc(rescue.id)
      .set({ status: STATUSES.COMPLETED, notes }, { merge: true })
      .then(() => setModal())
      .then(() => history.push(`/rescues/${rescue_id}/completed`))
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

export function CancelStop() {
  const [notes, setNotes] = useState('')
  const { setModal, modalState } = useApp()

  function handleCancel() {
    const collection =
      modalState.stop.type === 'pickup' ? 'pickups' : 'deliveries'
    getCollection(collection)
      .doc(modalState.stop.id)
      .set(
        {
          status: STATUSES.CANCELLED,
          notes,
        },
        { merge: true }
      )
      .then(() => setModal())
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

export function Stop({ stops, s, i }) {
  const history = useHistory()
  const { rescue_id } = useParams()
  const { setModal, setModalState } = useApp()
  const rescue = useFirestore('rescues', rescue_id)
  const pickups = useFirestore('pickups')

  const isActiveStop = rescue
    ? i === getNextIncompleteStopIndex(rescue, stops)
    : false
  const isCompletedStop = [STATUSES.COMPLETED, STATUSES.CANCELLED].includes(
    s.status
  )

  function RescueStatusIndicator({ rescue }) {
    if (rescue.status === STATUSES.COMPLETED) {
      return <div className="Rescues-stop-status">✅</div>
    } else if (rescue.status === STATUSES.CANCELLED) {
      return <div className="Rescues-stop-status">❌</div>
    } else if (rescue.status === STATUSES.SCHEDULED) {
      return <div className="Rescues-stop-status">🗓</div>
    } else if (rescue.status === STATUSES.ACTIVE) {
      return <div className="Rescues-stop-status">🚛</div>
    } else return null
  }

  function StopHeader() {
    const headerText =
      s.type && s.status && rescue
        ? s.type === 'delivery'
          ? `🟥 DELIVERY (${s.status.toUpperCase()})`
          : `🟩 PICKUP (${s.status.toUpperCase()})`
        : 'loading...'

    return (
      <div className="Rescue-stop-header">
        <Text
          type="small-header"
          color={
            isActiveStop ? (s.type === 'pickup' ? 'green' : 'red') : 'white'
          }
        >
          {headerText}
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
          color="black"
          classList={['Rescue-stop-instructions']}
        >
          <span>Instructions: </span>
          {s.location.notes}
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
        color={isActiveStop ? 'blue' : 'white'}
      >
        <div>🏢</div>
        <Spacer width={16} />
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
    return number ? (
      <ExternalLink to={`tel:${s.location.contact_phone}`}>
        <Button
          classList={['Rescue-stop-phone-button']}
          type="tertiary"
          size="small"
          color="blue"
        >
          <div>📞</div>
          <Spacer width={16} />
          {formatPhoneNumber(number)}
          {name && ` (ask for ${name})`}
        </Button>
      </ExternalLink>
    ) : null
  }

  function StopMap() {
    return s.location.lat && s.location.lng ? (
      <GoogleMap address={s.location} style={{ height: 200 }} zoom={14} />
    ) : null
  }

  function StopDirectionsButton() {
    async function handleClick() {
      setFirestoreData(
        [s.type === 'delivery' ? 'deliveries' : 'pickups', s.id],
        {
          status: STATUSES.ACTIVE,
          timestamp_started: createTimestamp(),
        }
      ).then(() =>
        window.open(
          generateDirectionsLink(
            s.location.address1,
            s.location.city,
            s.location.state,
            s.location.zip
          ),
          '_blank'
        )
      )
    }
    async function handleSkip() {
      if (s.organization.type === RECIPIENT_TYPES.HOME_DELIVERY) {
        handleSubmitHomeDelivery()
      } else {
        setFirestoreData(
          [s.type === 'delivery' ? 'deliveries' : 'pickups', s.id],
          {
            status: STATUSES.ACTIVE,
            timestamp_started: createTimestamp(),
          }
        ).then(() => history.push(`/rescues/${rescue_id}/${s.type}/${s.id}`))
      }
    }

    return (
      <>
        <Button
          type="primary"
          color="blue"
          size="large"
          fullWidth
          handler={handleClick}
        >
          Get Directions
        </Button>
        <Spacer height={24} />
        <Button
          type="tertiary"
          color="blue"
          size="medium"
          fullWidth
          handler={handleSkip}
        >
          Skip to Finish {s.type}
        </Button>
        <Spacer height={8} />
      </>
    )
  }

  function handleSubmitHomeDelivery() {
    const pickup = pickups.find(p => p.rescue_id === rescue.id)
    const percent_of_total_dropped = 1 / (rescue.stops.length - 1)
    setFirestoreData(['deliveries', s.id], {
      // calculate percentage based weight totals for each food category
      ...FOOD_CATEGORIES.reduce(
        (a, b) => (b[a] = Math.round(pickup[a] * percent_of_total_dropped)),
        {}
      ),
      impact_data_percent_of_total_dropped: parseInt(percent_of_total_dropped),
      impact_data_total_weight:
        Math.round(
          pickup.impact_data_total_weight *
            (parseInt(percent_of_total_dropped) / 100)
        ) || 0,
      timestamp_created: createTimestamp(),
      timestamp_updated: createTimestamp(),
      timestamp_finished: createTimestamp(),
      status: STATUSES.COMPLETED,
    })
      .then(() => history.push(`/rescues/${rescue_id}`))
      .catch(e => console.error('Error writing document: ', e))
  }

  function StopReportButton() {
    function handleOpenReport() {
      setFirestoreData(
        [s.type === 'delivery' ? 'deliveries' : 'pickups', s.id],
        {
          status: STATUSES.ACTIVE,
          driver_arrived_at: createTimestamp(),
        }
      ).then(() => history.push(`/rescues/${rescue_id}/${s.type}/${s.id}`))
    }

    function handleClick() {
      if (
        s.type === 'delivery' &&
        s.organization.type === RECIPIENT_TYPES.HOME_DELIVERY
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
        Finish {s.type} Report
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
        <Text classList={['StopSummary-notes']} type="paragraph" color="white">
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
      <Text type="section-header" color={isActiveStop ? 'black' : 'white'}>
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
        </>
      )}
    </Card>
  )

  return s.status === STATUSES.COMPLETED ||
    (rescue && rescue.status === STATUSES.COMPLETED)
    ? linkToReport(stopCard)
    : stopCard
}

export function RescueActionButton() {
  const { rescue_id } = useParams()
  const drivers = useFirestore('users')
  const { user, admin } = useAuth()
  const rescue = useFirestore('rescues', rescue_id)

  async function handleBegin() {
    await setFirestoreData(['rescues', rescue.id], {
      status: STATUSES.ACTIVE,
      timestamp_logged_start: createTimestamp(),
      timestamp_updated: createTimestamp(),
    })
  }

  async function handleClaim() {
    const event = await updateGoogleCalendarEvent({
      ...rescue,
      notes: null,
      driver: drivers.find(d => d.id === user.uid),
    })
    setFirestoreData(['rescues', rescue.id], {
      handler_id: user.uid,
      google_calendar_event_id: event.id,
      notes: '',
      timestamp_updated: createTimestamp(),
    })
    for (const stop of rescue.stops) {
      const collection = stop.type === 'pickup' ? 'pickups' : 'deliveries'
      setFirestoreData([collection, stop.id], {
        handler_id: user.uid,
      })
    }
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
    if (rescue.driver) {
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

export function BackupDelivery() {
  const [willFind, setWillFind] = useState()
  const [working, setWorking] = useState(false)
  const { rescue_id } = useParams()
  const rescue = useFirestore('rescues', rescue_id)

  if (rescue && areAllStopsCompleted(rescue.stops)) {
    let lastStop
    for (const s of rescue.stops) {
      if (
        s.status === STATUSES.COMPLETED &&
        (!lastStop || s.timestamp_finished > lastStop.timestamp_finished)
      )
        lastStop = s
    }
    if (
      lastStop &&
      (!lastStop.impact_data_total_weight ||
        lastStop.impact_data_percent_of_total_dropped < 100 ||
        lastStop.type === 'pickup')
    ) {
      async function addBackupDelivery(stop) {
        if (!working) {
          setWorking(true)
          const stop_id = generateStopId(stop)
          await setFirestoreData(['deliveries', stop_id], {
            id: stop_id,
            recipient_id: stop.recipient_id,
            location_id: stop.location_id,
            handler_id: rescue.handler_id,
            timestamp_created: createTimestamp(),
            timestamp_updated: createTimestamp(),
            timestamp_started: null,
            timestamp_finished: null,
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
            impact_data_percent_of_total_dropped: 0,
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
