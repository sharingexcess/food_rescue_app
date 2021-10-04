import React, { useEffect, useState } from 'react'
import {
  getCollection,
  setFirestoreData,
  updateGoogleCalendarEvent,
  generateStopId,
  CLOUD_FUNCTION_URLS,
  ROUTE_STATUSES,
} from 'helpers'
import moment from 'moment'
import UserIcon from 'assets/user.svg'
import { Link, useHistory, useParams } from 'react-router-dom'
import { Button, Image, Text } from '@sharingexcess/designsystem'
import { allFoodDelivered, areAllStopsCompleted } from './utils'
import { ChangeDriverModal, ContactModal } from './routeComponent'
import { Stop } from './Route.children'
import firebase from 'firebase/app'
import { EditDelivery, Input, Loading } from 'components'
import { useFirestore, useAuth } from 'hooks'

export function Route() {
  const history = useHistory()
  const { route_id } = useParams()
  const { user, admin } = useAuth()
  const route = useFirestore('routes', route_id)
  const drivers = useFirestore('users')
  const pickups = useFirestore('pickups')
  const deliveries = useFirestore('deliveries')
  const organizations = useFirestore('organizations')
  const locations = useFirestore('locations')
  const [contactModal, setContactModal] = useState(false)
  const [stops, setStops] = useState([])
  const [willCancel, setWillCancel] = useState()
  const [willComplete, setWillComplete] = useState()
  const [willDelete, setWillDelete] = useState()
  const [confDriver, setConfDriver] = useState()
  const [otherDriver, setOtherDriver] = useState()
  const [willAssign, setWillAssign] = useState()
  const canBeginRoute = admin
    ? true
    : moment(route?.time_start) <= moment() ||
      moment(route?.time_start).subtract(2, 'hours') <= moment()

  useEffect(() => {
    if (drivers && route) {
      route.driver = drivers.find(d => d.id === route.driver_id)
    }
  }, [drivers, route])

  useEffect(() => {
    let completed_deliveries = 0
    const route_deliveries = deliveries.filter(d => d.route_id === route_id)
    if (route_deliveries.length) {
      for (const d of route_deliveries) {
        if (d.status === 9) completed_deliveries++
      }
      if (completed_deliveries === route_deliveries.length) {
        setFirestoreData(['Routes', route_id], {
          status: 9,
          time_finished: firebase.firestore.FieldValue.serverTimestamp(),
        }).then(() => history.push(`/routes/${route_id}/completed`))
      }
    }
  }, [deliveries, route_id]) // eslint-disable-line

  useEffect(() => {
    async function updateStops() {
      const updated_stops = []
      for (const s of route.stops) {
        let stop =
          s.type === 'pickup'
            ? pickups.find(p => p.id === s.id)
            : deliveries.find(d => d.id === s.id)
        stop = { ...s, ...stop }
        stop.org = organizations.find(o => o.id === stop.org_id) || {}
        stop.location = locations.find(l => l.id === stop.location_id) || {}
        updated_stops.push(stop)
      }
      setStops(updated_stops)
    }
    route && route.stops && updateStops()
  }, [route, pickups, deliveries, organizations, locations]) // eslint-disable-line

  async function handleAssign(driver) {
    const event = await updateGoogleCalendarEvent({
      ...route,
      stops,
      driver,
      notes: null,
    })
    setFirestoreData(['Routes', route.id], {
      driver_id: driver.id,
      google_calendar_event_id: event.id,
      notes: null,
    })
    for (const stop of route.stops) {
      const collection = stop.type === 'pickup' ? 'Pickups' : 'Deliveries'
      setFirestoreData([collection, stop.id], {
        driver_id: driver.id,
      })
    }
  }

  function Driver() {
    return (
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
        <Button id="Route-edit-button" type="secondary" color="white">
          ···
        </Button>
      </div>
    )
  }

  function StatusButton() {
    const [notes, setNotes] = useState('')

    function handleBegin() {
      setFirestoreData(['Routes', route.id], {
        status: 3,
        time_started: firebase.firestore.FieldValue.serverTimestamp(),
      })
    }

    async function handleComplete() {
      await setFirestoreData(['Routes', route.id], {
        status: 9,
        notes,
        time_finished: firebase.firestore.FieldValue.serverTimestamp(),
      })
      history.push(`/routes/${route_id}/completed`)
    }

    async function handleClaim() {
      const event = await updateGoogleCalendarEvent({
        ...route,
        stops,
        notes: null,
        driver: drivers.find(d => d.id === user.uid),
      })
      setFirestoreData(['Routes', route.id], {
        driver_id: user.uid,
        google_calendar_event_id: event.id,
        notes: null,
      })
      for (const stop of route.stops) {
        debugger
        const collection = stop.type === 'pickup' ? 'Pickups' : 'Deliveries'
        setFirestoreData([collection, stop.id], {
          driver_id: user.uid,
        })
      }
    }

    async function handleUnassign() {
      const event = await updateGoogleCalendarEvent({
        ...route,
        stops,
        driver: null,
        notes: `Route dropped by ${route.driver.name}: "${notes}"`,
      })
      await setFirestoreData(['Routes', route.id], {
        driver_id: null,
        google_calendar_event_id: event.id,
        notes: `Route dropped by ${route.driver.name}: "${notes}"`,
      })
      for (const stop of route.stops) {
        const collection = stop.type === 'pickup' ? 'Pickups' : 'Deliveries'
        setFirestoreData([collection, stop.id], {
          driver_id: null,
        })
      }
    }

    function checkDriver(e) {
      const val = e.target.value
      const email = val.substring(val.indexOf('(') + 1, val.length - 1)
      const driver = drivers.find(d => d.email === email)

      if (user.uid === driver.id) {
        handleAssign(driver)
      } else {
        setOtherDriver(driver)
        setConfDriver(true)
      }
    }

    if (
      willCancel ||
      willDelete ||
      (!admin && route.driver_id && route.driver_id !== user.uid)
    )
      return null
    if (route.status === 1) {
      if (route.driver) {
        return (
          <div className={admin ? 'buttons' : ''}>
            {!willAssign && canBeginRoute && admin ? (
              <button className="blue" onClick={handleBegin}>
                begin route
                {admin && route.driver_id !== user.uid ? ' as admin' : ''}
              </button>
            ) : null}
            {admin ? (
              willAssign ? (
                <>
                  <Input
                    type="select"
                    label="Select Driver"
                    suggestions={drivers.map(d => `${d.name} (${d.email})`)}
                    onSuggestionClick={checkDriver}
                  />
                  <button
                    className="red"
                    onClick={() => setWillAssign(!willAssign)}
                  >
                    cancel re-assign route
                  </button>
                </>
              ) : (
                <button className="blue" onClick={() => setWillAssign(true)}>
                  re-assign route
                </button>
              )
            ) : willAssign ? (
              <>
                <Input
                  label="Why can't you complete this route?"
                  animation={false}
                  type="textarea"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
                <div className="buttons">
                  <button
                    className="red small"
                    onClick={() => setWillAssign(false)}
                  >
                    cancel
                  </button>
                  <button className="blue" onClick={handleUnassign}>
                    drop route
                  </button>
                </div>
              </>
            ) : (
              <button className="red" onClick={() => setWillAssign(true)}>
                drop route
              </button>
            )}
          </div>
        )
      } else if (admin) {
        return willAssign ? (
          <Input
            type="select"
            label="Select Driver"
            suggestions={drivers.map(d => `${d.name} (${d.email})`)}
            onSuggestionClick={checkDriver}
          />
        ) : (
          <button className="blue" onClick={() => setWillAssign(true)}>
            assign route
          </button>
        )
      } else
        return (
          <button className="blue" onClick={handleClaim}>
            claim route
          </button>
        )
    } else if (route.status === 3 && areAllStopsCompleted(stops)) {
      return willComplete ? (
        <>
          <Input
            label="Route notes..."
            animation={false}
            type="textarea"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <section className="buttons">
            <button
              className="yellow small"
              onClick={() => setWillComplete(false)}
            >
              back
            </button>
            <button onClick={handleComplete}>complete route</button>
          </section>
        </>
      ) : allFoodDelivered(stops) ? (
        <button className="blue" onClick={() => setWillComplete(true)}>
          finish route
        </button>
      ) : null
    } else return null
  }

  function CancelButton() {
    const [notes, setNotes] = useState('')

    function handleCancel() {
      setWillCancel(false)
      getCollection('Routes')
        .doc(route.id)
        .set({ status: 0, notes }, { merge: true })
        .then(() => {
          fetch(CLOUD_FUNCTION_URLS.deleteCalendarEvent, {
            method: 'POST',
            body: JSON.stringify({
              calendarId: process.env.REACT_APP_GOOGLE_CALENDAR_ID,
              eventId: route.google_calendar_event_id,
            }),
          }).catch(e => console.error('Error deleting calendar event:', e))
        })
    }

    if (
      willComplete ||
      willDelete ||
      [0, 9].includes(route.status) ||
      (!admin && route.driver_id !== user.uid)
    )
      return null
    return willCancel ? (
      <>
        <Input
          label="Why are you cancelling the route?"
          animation={false}
          type="textarea"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        <section className="buttons">
          <button className="yellow small" onClick={() => setWillCancel(false)}>
            back
          </button>
          <button className="red" onClick={handleCancel}>
            cancel route
          </button>
        </section>
      </>
    ) : (
      <button className="yellow" onClick={() => setWillCancel(true)}>
        cancel route
      </button>
    )
  }

  function DeleteButton() {
    async function handleDeleteRoute() {
      await fetch(CLOUD_FUNCTION_URLS.deleteCalendarEvent, {
        method: 'POST',
        body: JSON.stringify({
          calendarId: process.env.REACT_APP_GOOGLE_CALENDAR_ID,
          eventId: route.google_calendar_event_id,
        }),
      }).catch(e => console.error('Error deleting calendar event:', e))
      for (const stop of route.stops) {
        if (stop.type === 'pickup') {
          await getCollection('Pickups').doc(stop.id).delete()
        } else if (stop.type === 'delivery') {
          await getCollection('Deliveries').doc(stop.id).delete()
        }
      }
      await getCollection('Routes').doc(route.id).delete()
      history.push('/routes')
    }

    if (willCancel || willComplete) return null
    return willDelete ? (
      <section className="buttons">
        <button className="yellow small" onClick={() => setWillDelete(false)}>
          back
        </button>
        <button className="red" onClick={handleDeleteRoute}>
          confirm delete
        </button>
      </section>
    ) : (
      <button className="red" onClick={() => setWillDelete(true)}>
        delete route
      </button>
    )
  }

  function CancelStop({ stop }) {
    const [cancelStop, setCancelStop] = useState()
    const [cancelNotes, setCancelNotes] = useState('')

    function handleCancel() {
      setCancelStop(false)
      const collection = stop.type === 'pickup' ? 'Pickups' : 'Deliveries'
      getCollection(collection)
        .doc(stop.id)
        .set(
          {
            status: 0,
            report: stop.report
              ? { ...stop.report, notes: cancelNotes }
              : { notes: cancelNotes },
          },
          { merge: true }
        )
        .then(() => window.location.reload())
    }

    return cancelStop ? (
      <>
        <Input
          label="Why are you cancelling this stop?"
          animation={false}
          type="textarea"
          value={cancelNotes}
          onChange={e => setCancelNotes(e.target.value)}
        />
        <section className="buttons">
          <button className="yellow small" onClick={() => setCancelStop(false)}>
            back
          </button>
          <button className="red" onClick={handleCancel}>
            cancel stop
          </button>
        </section>
      </>
    ) : (
      <button className="secondary" onClick={() => setCancelStop(true)}>
        cancel stop
      </button>
    )
  }

  function BackupDelivery() {
    const [willFind, setWillFind] = useState()
    if (areAllStopsCompleted(stops)) {
      let lastStop
      for (const s of stops) {
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
          const stop_id = generateStopId(stop)
          await setFirestoreData(['Deliveries', stop_id], {
            id: stop_id,
            org_id: stop.org_id,
            location_id: stop.location_id,
            driver_id: route.driver_id,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            updated_at: firebase.firestore.FieldValue.serverTimestamp(),
            status: 1,
            pickup_ids: lastStop.pickup_ids || lastStop.id,
            route_id,
          })
          await setFirestoreData(['Routes', route.id], {
            stops: [...route.stops, { type: 'delivery', id: stop_id }],
          })
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
                <h4>Looks like you have left over food!</h4>
                <p>Add another delivery location to finish your route.</p>
                <button onClick={() => setWillFind(true)}>
                  add another delivery
                </button>
              </>
            )}
          </div>
        )
      }
    }
    return null
  }

  return (
    <main id="Route">
      {!route ? (
        <Loading />
      ) : (
        <>
          <Driver />
          {stops.length ? (
            <>
              <section className="Stops">
                {stops.map((s, i) => (
                  <Stop stops={stops} s={s} i={i} key={i} />
                ))}
              </section>
              {!admin && route.driver && (
                <div>
                  <button onClick={() => setContactModal(true)}>
                    contact admin{' '}
                  </button>
                  {contactModal === true ? (
                    <ContactModal onShowModal={() => setContactModal(false)} />
                  ) : null}
                </div>
              )}
              {route.status === 3 &&
                admin === true &&
                route.status === 3 &&
                areAllStopsCompleted(stops) &&
                !allFoodDelivered(stops) && <BackupDelivery />}
              {(route.status === 1 || route.status === 3) &&
                route.driver &&
                admin && (
                  <Link to={`/routes/${route.id}/edit`} className="buttons">
                    <button>Edit Stops</button>
                  </Link>
                )}
              <StatusButton />
              {admin === true ? <CancelButton /> : null}
              {admin === true ? <DeleteButton /> : null}
              <ChangeDriverModal
                openModal={confDriver}
                text={
                  'Are you sure you want to re-assign this route to another driver?'
                }
                onConfirm={() => {
                  handleAssign(otherDriver)
                  setConfDriver(false)
                }}
                onClose={() => setConfDriver(false)}
              />
            </>
          ) : (
            <Loading text="Loading stops on route" relative />
          )}
        </>
      )}
    </main>
  )
}
