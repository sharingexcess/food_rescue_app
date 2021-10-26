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
import firebase from 'firebase/app'
import {
  CLOUD_FUNCTION_URLS,
  createServerTimestamp,
  formatPhoneNumber,
  generateStopId,
  getCollection,
  ROUTE_STATUSES,
  setFirestoreData,
  STOP_STATUSES,
  updateGoogleCalendarEvent,
} from 'helpers'
import { useAuth, useFirestore, useApp } from 'hooks'
import { Link, useHistory, useLocation, useParams } from 'react-router-dom'
import {
  areAllStopsCompleted,
  generateDirectionsLink,
  getNextIncompleteStopIndex,
} from './utils'
import UserIcon from 'assets/user.svg'
import moment from 'moment'


export function RouteHeader() {
  const { setModal } = useApp()
  const { route_id } = useParams()
  const route = useFirestore('routes', route_id)

  return route ? (
    <div id="Driver" type="secondary">
      <Image
        src={route.driver ? route.driver.icon : UserIcon}
        alt={route.driver ? route.driver.name : 'No assigned driver'}
      />
      <div>
        <Text type="small-header" color="white" shadow>
          {ROUTE_STATUSES[route.status].toUpperCase()} ROUTE
        </Text>
        <Text type="section-header" color="white" shadow>
          {route.driver ? route.driver.name : 'No assigned driver'}
        </Text>
        <Text type="small" color="white" shadow>
          {moment(route.time_start).format('ddd, MMM D, h:mma')} (
          {route.stops.length} total stops)
        </Text>
        {route.notes ? (
          <Text type="small" color="white" shadow>
            Notes: {route.notes}
          </Text>
        ) : null}
      </div>
      <Button
        id="Route-edit-button"
        type="secondary"
        color="white"
        handler={() => setModal('RouteMenu')}
      >
        <i className="fa fa-ellipsis-v" />
      </Button>
    </div>
  ) : null
}

export function RouteMenu() {
  const { setModal, modalState } = useApp()
  const { user, admin } = useAuth()

  function RouteOption({ name, modalName }) {
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

  return (
    <div id="RouteMenu">
      <Text type="secondary-header" color="black">
        Route Options
      </Text>
      <Spacer height={8} />
      <ul>
        {user.id === modalState.route.driver_id || admin ? (
          <>
            <li>
              <RouteOption modalName="FinishRoute" name="Force Finish Route" />
            </li>
          </>
        ) : null}

        {user.id === modalState.route.driver_id ? (
          <>
            <li>
              <RouteOption modalName="DropRoute" name="Drop Route" />
            </li>
            <li>
              <RouteOption modalName="ContactAdmin" name="Contact Admin" />
            </li>
          </>
        ) : null}
        {admin ? (
          <>
            <li>
              <Link to={`/routes/${modalState.route.id}/edit`}>
                <Button type="tertiary" color="blue" size="large">
                  Edit Route
                </Button>
              </Link>
            </li>
            <li>
              <RouteOption modalName="CancelRoute" name="Cancel Route" />
            </li>
          </>
        ) : null}
      </ul>
    </div>
  )
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

export function DropRoute() {
  const { setModal, modalState } = useApp()
  const [notes, setNotes] = useState('')

  async function handleUnassign() {
    const event = await updateGoogleCalendarEvent({
      ...modalState.route,
      stops: modalState.route.stops,
      driver: null,
      notes: `Route dropped by ${modalState.route.driver.name}: "${notes}"`,
    })
    await setFirestoreData(['Routes', modalState.route.id], {
      driver_id: null,
      google_calendar_event_id: event.id,
      notes: `Route dropped by ${modalState.route.driver.name}: "${notes}"`,
      updated_at: createServerTimestamp(),
    })
    for (const stop of modalState.route.stops) {
      const collection = stop.type === 'pickup' ? 'Pickups' : 'Deliveries'
      setFirestoreData([collection, stop.id], {
        driver_id: null,
      })
    }
    setModal()
  }

  return (
    <>
      <Text type="secondary-header" color="black">
        Drop Route
      </Text>
      <Spacer height={4} />
      <Button
        type="tertiary"
        color="blue"
        handler={() => setModal('RouteMenu')}
      >
        &lt; Back to Route Options
      </Button>
      <Input
        label="Why can't you complete this route?"
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
        Confirm Drop Route
      </Button>
    </>
  )
}

export function CancelRoute() {
  const { setModal, modalState } = useApp()
  const [notes, setNotes] = useState()

  async function handleCancel() {
    getCollection('Routes')
      .doc(modalState.route.id)
      .set({ status: 0, notes }, { merge: true })
      .then(() => {
        fetch(CLOUD_FUNCTION_URLS.deleteCalendarEvent, {
          method: 'POST',
          body: JSON.stringify({
            calendarId: process.env.REACT_APP_GOOGLE_CALENDAR_ID,
            eventId: modalState.route.google_calendar_event_id,
          }),
        }).catch(e => console.error('Error deleting calendar event:', e))
      })
      .then(() => setModal())
  }

  return (
    <>
      <Text type="secondary-header" color="black">
        Cancel Route
      </Text>
      <Spacer height={4} />
      <Button
        type="tertiary"
        color="blue"
        handler={() => setModal('RouteMenu')}
      >
        &lt; Back to Route Options
      </Button>
      <Input
        label="Why can't you complete this route?"
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
        Confirm Cancel Route
      </Button>
    </>
  )
}

export function FinishRoute() {
  const { setModal, modalState } = useApp()
  const [notes, setNotes] = useState('')
  const history = useHistory()

  async function handleFinish() {
    getCollection('Routes')
      .doc(modalState.route.id)
      .set({ status: 9, notes }, { merge: true })
      .then(() => setModal())
      .then(() => history.push(`/routes/${modalState.route.id}/completed`))
  }

  return (
    <>
      <Text type="secondary-header" color="black">
        Finish Route
      </Text>
      <Spacer height={4} />
      <Button
        type="tertiary"
        color="blue"
        handler={() => setModal('RouteMenu')}
      >
        &lt; Back to Route Options
      </Button>
      <Input
        label="Route notes..."
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
        Confirm Finish Route
      </Button>
    </>
  )
}

export function CancelStop() {
  const [notes, setNotes] = useState('')
  const { setModal, modalState } = useApp()

  function handleCancel() {
    const collection =
      modalState.stop.type === 'pickup' ? 'Pickups' : 'Deliveries'
    getCollection(collection)
      .doc(modalState.stop.id)
      .set(
        {
          status: 0,
          report: modalState.stop.report
            ? { ...modalState.stop.report, notes }
            : { notes },
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
        handler={() => setModal('RouteMenu')}
      >
        &lt; Back to Route Options
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
  const location = useLocation()
  const history = useHistory()
  const { route_id } = useParams()
  const { setModal, setModalState } = useApp()
  const route = useFirestore('routes', route_id)
  const { user, admin } = useAuth()
  const pickups = useFirestore('pickups')
  const organizations = useFirestore('organizations')

  const isActiveStop = route
    ? i === getNextIncompleteStopIndex(route, stops)
    : false

  const isCompletedStop = s.status === 9 || s.status === 0

  function hasEditPermissions() {
    return admin || (route && user && user.uid === route.driver_id)
  }

  function RouteStatusIndicator({ route }) {
    if (route.status === 9) {
      return <div className="Routes-stop-status">✅</div>
    } else if (route.status === 0) {
      return <div className="Routes-stop-status">❌</div>
    } else if (route.status === 1) {
      return <div className="Routes-stop-status">🗓</div>
    } else if (route.status === 3) {
      return <div className="Routes-stop-status">🚛</div>
    } else return null
  }

  function StopHeader() {
    const headerText =
      s.type && s.status && route
        ? s.type === 'delivery'
          ? `🟥 DELIVERY${
              route.status !== 0
                ? ' (' +
                  STOP_STATUSES[s.status].replace('_', ' ').toUpperCase() +
                  ')'
                : ''
            }`
          : `🟩 PICKUP${
              route.status !== 0
                ? ' (' +
                  STOP_STATUSES[s.status].replace('_', ' ').toUpperCase() +
                  ')'
                : ''
            }`
        : s.status === 0
        ? `Cancelled ${s.type}`.toUpperCase()
        : 'loading...'

    return (
      <div className="Route-stop-header">
        
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
            id="Route-stop-edit-button"
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
        <RouteStatusIndicator route={s}/>
      </div>
    )
  }

  function StopInstructions() {
    return s.location.upon_arrival_instructions ? (
      <>
        <Spacer height={16} />
        <Text
          type="small"
          color="black"
          classList={['Route-stop-instructions']}
        >
          <span>Instructions: </span>
          {s.location.upon_arrival_instructions}
        </Text>
      </>
    ) : null
  }

  function StopAddress() {
    const button = (
      <Button
        classList={['Route-stop-address-button']}
        type="tertiary"
        size="small"
        color={isActiveStop ? 'blue' : 'white'}
      >
        <div>🏢</div>
        <Spacer width={16} />
        {s.location.address1}
        {s.location.address2 && ` - ${s.location.address2}`}
        <br />
        {s.location.city}, {s.location.state} {s.location.zip_code}
      </Button>
    )

    return s.status && s.status !== 9 ? (
      <ExternalLink to={generateDirectionsLink(s.location)}>
        {button}
      </ExternalLink>
    ) : (
      button
    )
  }

  function StopContact({ name, number }) {
    return (
      <ExternalLink
        to={`tel:${s.location.contact_phone || s.org.default_contact_phone}`}
      >
        <Button
          classList={['Route-stop-phone-button']}
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
    )
  }

  function StopMap() {
    return s.location.lat && s.location.lng ? (
      <GoogleMap address={s.location} style={{ height: 200 }} zoom={14} />
    ) : null
  }

  function StopDirectionsButton() {
    async function handleClick() {
      setFirestoreData(
        [s.type === 'delivery' ? 'Deliveries' : 'Pickups', s.id],
        {
          status: 3,
          driver_left_at: createServerTimestamp(),
        }
      ).then(() => window.open(generateDirectionsLink(s.location), '_blank'))
    }
    async function handleSkip() {
      const org = organizations.find(o => o.id === s.org_id)
      if (org.org_type === 'home delivery') {
        handleSubmitHomeDelivery()
      } else {
        const baseURL = location.pathname.includes('routes')
          ? 'routes'
          : 'history'
        setFirestoreData(
          [s.type === 'delivery' ? 'Deliveries' : 'Pickups', s.id],
          {
            status: 3,
            driver_left_at: createServerTimestamp(),
          }
        ).then(() => history.push(`/${baseURL}/${route_id}/${s.type}/${s.id}`))
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
    const pickup = pickups.find(p => p.route_id === route.id)
    const weight = pickup.report.weight
    const percent_of_total_dropped = 1 / (route.stops.length - 1)
    setFirestoreData(['Deliveries', s.id], {
      report: {
        percent_of_total_dropped: parseInt(percent_of_total_dropped),
        weight: isNaN(weight)
          ? 0
          : Math.round(weight * percent_of_total_dropped),
        created_at: createServerTimestamp(),
        updated_at: createServerTimestamp(),
      },
      time_finished: createServerTimestamp(),
      status: 9,
    })
      .then(() => history.push(`/routes/${route_id}`))
      .catch(e => console.error('Error writing document: ', e))
  }

  function StopReportButton() {
    function handleOpenReport() {
      const baseURL = location.pathname.includes('routes')
        ? 'routes'
        : 'history'

      setFirestoreData(
        [s.type === 'delivery' ? 'Deliveries' : 'Pickups', s.id],
        {
          status: 6,
          driver_arrived_at: createServerTimestamp(),
        }
      ).then(() => history.push(`/${baseURL}/${route_id}/${s.type}/${s.id}`))
    }

    function handleClick() {
      const org = organizations.find(o => o.id === s.org_id)
      if (org.org_type === 'home delivery') {
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
          name={s.location.contact_name || s.org.default_contact_name}
          number={s.location.contact_phone || s.org.default_contact_phone}
        />
        <StopInstructions />
        <Spacer height={16} />
        <StopMap />
        <Spacer height={24} />
        {s.status === 1 && <StopDirectionsButton />}
        {(s.status === 3 || s.status === 6) && <StopReportButton />}
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
          {s.status === 9 &&
            s.report.weight +
              ' lbs. ' +
              (s.type === 'pickup' ? 'rescued' : 'delivered')}
          {s.report.notes && `\n"${s.report.notes}"`}
        </Text>
      </>
    )
  }

  function linkToReport(children) {
    return (
      <Link
        style={{ width: '100%' }}
        to={`/routes/${route_id}/${s.type}/${s.id}`}
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
        {s.org.name}
        {s.location.name ? ` (${s.location.name})` : ''}
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
      {/* TODO: cancel individual stop logic */}
      {hasEditPermissions() ? (
        <>
          {/* {isActiveStop ? (
            <>{s.status < 9 && admin ? <CancelStop stop={s} /> : null}</>
          ) : null} */}
        </>
      ) : null}
    </Card>
  )

  // Make the Card Clickable as a link to the Stop Report
  // if the stop is already completed (s.status === 9)
  // or if the route is already completed (route.status === 9)
  return s.status === 9 || (route && route.status === 9)
    ? linkToReport(stopCard)
    : stopCard
}

export function RouteActionButton() {
  const { route_id } = useParams()
  const drivers = useFirestore('users')
  const { user, admin } = useAuth()
  const { modalState } = useApp()

  async function handleBegin() {
    await setFirestoreData(['Routes', modalState.route.id], {
      status: 3,
      time_started: createServerTimestamp(),
      updated_at: createServerTimestamp(),
    })
  }

  async function handleClaim() {
    const event = await updateGoogleCalendarEvent({
      ...modalState.route,
      notes: null,
      driver: drivers.find(d => d.id === user.uid),
    })
    setFirestoreData(['Routes', modalState.route.id], {
      driver_id: user.uid,
      google_calendar_event_id: event.id,
      notes: null,
      updated_at: createServerTimestamp(),
    })
    for (const stop of modalState.route.stops) {
      const collection = stop.type === 'pickup' ? 'Pickups' : 'Deliveries'
      setFirestoreData([collection, stop.id], {
        driver_id: user.uid,
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
  if (!modalState || !modalState.route) return null
  if (modalState.route.status === 1) {
    if (modalState.route.driver) {
      return <ActionButton handler={handleBegin}>Start Route</ActionButton>
    } else {
      if (admin) {
        return (
          <ActionButton link={`/routes/${route_id}/edit`}>
            Assign Driver
          </ActionButton>
        )
      } else
        return <ActionButton handler={handleClaim}>Claim Route</ActionButton>
    }
  }
  return null
}

export function BackupDelivery() {
  const [willFind, setWillFind] = useState()
  const [working, setWorking] = useState(false)
  const { modalState } = useApp()
  const { route_id } = useParams()
  if (areAllStopsCompleted(modalState.route.stops)) {
    let lastStop
    for (const s of modalState.route.stops) {
      if (
        s.status === 9 &&
        (!lastStop || s.time_finished > lastStop.time_finished)
      )
        lastStop = s
    }
    if (
      lastStop &&
      (!lastStop.report.weight ||
        lastStop.report.percent_of_total_dropped < 100 ||
        lastStop.type === 'pickup')
    ) {
      async function addBackupDelivery(stop) {
        if (!working) {
          setWorking(true)
          const stop_id = generateStopId(stop)
          await setFirestoreData(['Deliveries', stop_id], {
            id: stop_id,
            org_id: stop.org_id,
            location_id: stop.location_id,
            driver_id: modalState.route.driver_id,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            updated_at: firebase.firestore.FieldValue.serverTimestamp(),
            status: 1,
            pickup_ids: lastStop.pickup_ids || lastStop.id,
            route_id,
          })
          await setFirestoreData(['Routes', route_id], {
            stops: [
              ...modalState.route.stops.map(s => ({ type: s.type, id: s.id })),
              { type: 'delivery', id: stop_id },
            ],
            updated_at: createServerTimestamp(),
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
              <button
                className="yellow small"
                onClick={() => setWillFind(false)}
              >
                cancel
              </button>
            </>
          ) : (
            <>
              <Text type="section-header" color="white" shadow>
                Looks like you have left over food!
              </Text>
              <Text type="paragraph" color="white" shadow>
                Add another delivery location to finish your route.
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
