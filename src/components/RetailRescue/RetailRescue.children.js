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
  createTimestamp,
  formatPhoneNumber,
  generateStopId,
  getCollection,
  setFirestoreData,
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

export function RetailRescueHeader() {
  const { setModal } = useApp()
  const { rescue_id } = useParams()
  const retail_rescue = useFirestore('retail_rescues', rescue_id)

  return retail_rescue ? (
    <div id="Driver" type="secondary">
      <Image
        src={retail_rescue.driver ? retail_rescue.driver.icon : UserIcon}
        alt={
          retail_rescue.driver
            ? retail_rescue.driver.name
            : 'No assigned driver'
        }
      />
      <div>
        <Text type="small-header" color="white" shadow>
          {retail_rescue.status.toUpperCase()} RESCUE
        </Text>
        <Text type="section-header" color="white" shadow>
          {retail_rescue.driver
            ? retail_rescue.driver.name
            : 'No assigned driver'}
        </Text>
        <Text type="small" color="white" shadow>
          {moment(retail_rescue.timestamps.scheduled_start).format(
            'ddd, MMM D, h:mma'
          )}{' '}
          ({retail_rescue.stops.length} total stops)
        </Text>
        {retail_rescue.notes ? (
          <Text type="small" color="white" shadow>
            Notes: {retail_rescue.notes}
          </Text>
        ) : null}
      </div>
      <Button
        id="RetailRescue-edit-button"
        type="secondary"
        color="white"
        handler={() => setModal('RetailRescueMenu')}
      >
        <i className="fa fa-ellipsis-v" />
      </Button>
    </div>
  ) : null
}

export function RetailRescueMenu() {
  const { setModal } = useApp()
  const { user, admin } = useAuth()
  const { rescue_id } = useParams()
  const retail_rescue = useFirestore('retail_rescues', rescue_id)

  function RetailRescueOption({ name, modalName }) {
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

  return retail_rescue ? (
    <div id="RetailRescueMenu">
      <Text type="secondary-header" color="black">
        Rescue Options
      </Text>
      <Spacer height={8} />
      <ul>
        {user.id === retail_rescue.handler_id || admin ? (
          <>
            <li>
              <RetailRescueOption
                modalName="FinishRetailRescue"
                name="Force Finish Rescue"
              />
            </li>
          </>
        ) : null}

        {user.id === retail_rescue.handler_id ? (
          <>
            <li>
              <RetailRescueOption
                modalName="DropRetailRescue"
                name="Drop Rescue"
              />
            </li>
            <li>
              <RetailRescueOption
                modalName="ContactAdmin"
                name="Contact Admin"
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
              <RetailRescueOption
                modalName="CancelRetailRescue"
                name="Cancel RetailRescue"
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

export function DropRetailRescue() {
  const { setModal } = useApp()
  const [notes, setNotes] = useState('')
  const { rescue_id } = useParams()
  const retail_rescue = useFirestore('retail_rescues', rescue_id)

  async function handleUnassign() {
    const event = await updateGoogleCalendarEvent({
      ...retail_rescue,
      driver: null,
      notes: `RetailRescue dropped by ${retail_rescue.driver.name}: "${notes}"`,
    })
    await setFirestoreData(['retail_rescues', retail_rescue.id], {
      handler_id: null,
      google_calendar_event_id: event.id,
      notes: `Rescue dropped by ${retail_rescue.driver.name}: "${notes}"`,
      updated_at: createTimestamp(),
    })
    for (const stop of retail_rescue.stops) {
      const collection = stop.type === 'pickup' ? 'pickups' : 'deliveries'
      setFirestoreData([collection, stop.id], {
        handler_id: null,
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
        handler={() => setModal('RetailRescueMenu')}
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

export function CancelRetailRescue() {
  const { setModal } = useApp()
  const [notes, setNotes] = useState()
  const { rescue_id } = useParams()
  const retail_rescue = useFirestore('retail_rescues', rescue_id)

  async function handleCancel() {
    getCollection('RetailRescues')
      .doc(retail_rescue.id)
      .set({ status: 'cancelled', notes }, { merge: true })
      .then(() => {
        fetch(CLOUD_FUNCTION_URLS.deleteCalendarEvent, {
          method: 'POST',
          body: JSON.stringify({
            calendarId: process.env.REACT_APP_GOOGLE_CALENDAR_ID,
            eventId: retail_rescue.google_calendar_event_id,
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
        handler={() => setModal('RetailRescueMenu')}
      >
        &lt; Back to Rescue Options
      </Button>
      <Input
        label="Why can't you complete this retail_rescue?"
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

export function FinishRetailRescue() {
  const { setModal } = useApp()
  const [notes, setNotes] = useState('')
  const history = useHistory()
  const { rescue_id } = useParams()
  const retail_rescue = useFirestore('retail_rescues', rescue_id)

  async function handleFinish() {
    getCollection('retail_rescues')
      .doc(retail_rescue.id)
      .set({ status: 'completed', notes }, { merge: true })
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
        handler={() => setModal('RetailRescueMenu')}
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
          status: 'cancelled',
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
        handler={() => setModal('RetailRescueMenu')}
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
  const retail_rescue = useFirestore('retail_rescues', rescue_id)
  const { user, admin } = useAuth()
  const pickups = useFirestore('pickups')
  const organizations = useFirestore('organizations')

  const isActiveStop = retail_rescue
    ? i === getNextIncompleteStopIndex(retail_rescue, stops)
    : false

  const isCompletedStop = s.status === 'completed' || s.status === 'cancelled'

  function hasEditPermissions() {
    return (
      admin || (retail_rescue && user && user.uid === retail_rescue.handler_id)
    )
  }

  function RetailRescueStatusIndicator({ retail_rescue }) {
    if (retail_rescue.status === 'completed') {
      return <div className="RetailRescues-stop-status">✅</div>
    } else if (retail_rescue.status === 'cancelled') {
      return <div className="RetailRescues-stop-status">❌</div>
    } else if (retail_rescue.status === 'scheduled') {
      return <div className="RetailRescues-stop-status">🗓</div>
    } else if (retail_rescue.status === 'active') {
      return <div className="RetailRescues-stop-status">🚛</div>
    } else return null
  }

  function StopHeader() {
    const headerText =
      s.type && s.status && retail_rescue
        ? s.type === 'delivery'
          ? `🟥 DELIVERY (${s.status.toUpperCase()})`
          : `🟩 PICKUP (${s.status.toUpperCase()})`
        : 'loading...'

    return (
      <div className="RetailRescue-stop-header">
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
            id="RetailRescue-stop-edit-button"
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
        <RetailRescueStatusIndicator retail_rescue={s} />
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
          classList={['RetailRescue-stop-instructions']}
        >
          <span>Instructions: </span>
          {s.location.notes}
        </Text>
      </>
    ) : null
  }

  function StopAddress() {
    const { address1, address2, city, state, zip } = s.location.address
    const button = (
      <Button
        classList={['RetailRescue-stop-address-button']}
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

    return s.status && s.status !== 9 ? (
      <ExternalLink to={generateDirectionsLink(s.location.address)}>
        {button}
      </ExternalLink>
    ) : (
      button
    )
  }

  function StopContact({ name, number }) {
    return (
      <ExternalLink to={`tel:${s.location.contact.phone}`}>
        <Button
          classList={['RetailRescue-stop-phone-button']}
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
    return s.location.address.lat && s.location.address.lng ? (
      <GoogleMap
        address={s.location.address}
        style={{ height: 200 }}
        zoom={14}
      />
    ) : null
  }

  function StopDirectionsButton() {
    async function handleClick() {
      setFirestoreData(
        [s.type === 'delivery' ? 'deliveries' : 'pickups', s.id],
        {
          status: 'active',
          driver_left_at: createTimestamp(),
        }
      ).then(() =>
        window.open(generateDirectionsLink(s.location.address), '_blank')
      )
    }
    async function handleSkip() {
      const org = organizations.find(o => o.id === s.org_id)
      if (org.org_type === 'home_delivery') {
        handleSubmitHomeDelivery()
      } else {
        setFirestoreData(
          [s.type === 'delivery' ? 'deliveries' : 'pickups', s.id],
          {
            status: 'active',
            driver_left_at: createTimestamp(),
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
    const pickup = pickups.find(p => p.rescue_id === retail_rescue.id)
    const weight = pickup.report.total_weight
    const percent_of_total_dropped = 1 / (retail_rescue.stops.length - 1)
    setFirestoreData(['deliveries', s.id], {
      impact_data: {
        percent_of_total_dropped: parseInt(percent_of_total_dropped),
        weight: isNaN(weight)
          ? 0
          : Math.round(weight * percent_of_total_dropped),
        created_at: createTimestamp(),
        updated_at: createTimestamp(),
      },
      time_finished: createTimestamp(),
      status: 'completed',
    })
      .then(() => history.push(`/rescues/${rescue_id}`))
      .catch(e => console.error('Error writing document: ', e))
  }

  function StopReportButton() {
    function handleOpenReport() {
      setFirestoreData(
        [s.type === 'delivery' ? 'deliveries' : 'pickups', s.id],
        {
          status: 'arrived',
          driver_arrived_at: createTimestamp(),
        }
      ).then(() => history.push(`/rescues/${rescue_id}/${s.type}/${s.id}`))
    }

    function handleClick() {
      const org = organizations.find(o => o.id === s.org_id)
      if (org.org_type === 'home_delivery') {
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
          name={s.location.contact.name}
          number={s.location.contact.phone}
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
          {s.status === 'completed' &&
            s.impact_data.total_weight +
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

  // Make the Card Clickable as a link to the Stop Report
  // if the stop is already completed (s.status === 9)
  // or if the retail_rescue is already completed (retail_rescue.status === 9)
  return s.status === 'completed' ||
    (retail_rescue && retail_rescue.status === 'completed')
    ? linkToReport(stopCard)
    : stopCard
}

export function RetailRescueActionButton() {
  const { rescue_id } = useParams()
  const drivers = useFirestore('users')
  const { user, admin } = useAuth()
  const retail_rescue = useFirestore('retail_rescues', rescue_id)

  async function handleBegin() {
    await setFirestoreData(['RetailRescues', retail_rescue.id], {
      status: 'active',
      time_started: createTimestamp(),
      updated_at: createTimestamp(),
    })
  }

  async function handleClaim() {
    const event = await updateGoogleCalendarEvent({
      ...retail_rescue,
      notes: null,
      driver: drivers.find(d => d.id === user.uid),
    })
    setFirestoreData(['retail_rescues', retail_rescue.id], {
      handler_id: user.uid,
      google_calendar_event_id: event.id,
      notes: null,
      updated_at: createTimestamp(),
    })
    for (const stop of retail_rescue.stops) {
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
  if (!retail_rescue) return null
  if (retail_rescue.status === 'scheduled') {
    if (retail_rescue.driver) {
      return (
        <ActionButton handler={handleBegin}>Start RetailRescue</ActionButton>
      )
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
  const retail_rescue = useFirestore('retail_rescues', rescue_id)

  if (areAllStopsCompleted(retail_rescue.stops)) {
    let lastStop
    for (const s of retail_rescue.stops) {
      if (
        s.status === 'completed' &&
        (!lastStop || s.timestamps.finished > lastStop.timestamps.finished)
      )
        lastStop = s
    }
    if (
      lastStop &&
      (!lastStop.impact_data.total_weight ||
        lastStop.impact_data.percent_of_total_dropped < 100 ||
        lastStop.type === 'pickup')
    ) {
      async function addBackupDelivery(stop) {
        if (!working) {
          setWorking(true)
          const stop_id = generateStopId(stop)
          await setFirestoreData(['deliveries', stop_id], {
            id: stop_id,
            organization_id: stop.organization_id,
            location_id: stop.location_id,
            handler_id: retail_rescue.handler_id,
            created_at: createTimestamp(),
            updated_at: createTimestamp(),
            status: 'scheduled',
            pickup_ids: lastStop.pickup_ids || lastStop.id,
            rescue_id,
          })
          await setFirestoreData(['retail_rescues', rescue_id], {
            stop_ids: [...retail_rescue.stops.map(s => s.id), stop_id],
            updated_at: createTimestamp(),
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
                Add another delivery location to finish your retail_rescue.
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
