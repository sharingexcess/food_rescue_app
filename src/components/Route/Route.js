import React, { useEffect, useState } from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { getCollection, formatPhoneNumber } from '../../helpers/helpers'
import Loading from '../Loading/Loading'
import moment from 'moment'
import UserIcon from '../../assets/user.svg'
import './Route.scss'
import { useHistory, useParams } from 'react-router-dom'
import Ellipsis, { ExternalLink, GoBack } from '../../helpers/components'
import { generateDirectionsLink } from './utils'
import { CLOUD_FUNCTION_URLS, ROUTE_STATUSES } from '../../helpers/constants'
import { useAuthContext } from '../Auth/Auth'
import { Input } from '../Input/Input'

function Route() {
  const history = useHistory()
  const { route_id } = useParams()
  const { user, admin } = useAuthContext()
  const [route = {}, loading] = useDocumentData(
    getCollection('Routes').doc(route_id)
  )
  const [stops, setStops] = useState([])
  const [startTime, setStartTime] = useState()
  const [endTime, setEndTime] = useState()
  const [driver = {}] = useDocumentData(
    route.driver_id ? getCollection('Users').doc(route.driver_id) : null
  )
  const [willCancel, setWillCancel] = useState()
  const [willComplete, setWillComplete] = useState()
  const [willDelete, setWillDelete] = useState()

  useEffect(() => {
    async function updateStops() {
      const updated_stops = []
      for (const s of route.stops) {
        const collection = s.type === 'pickup' ? 'Pickups' : 'Deliveries'
        let stop = await getCollection(collection)
          .doc(s.id)
          .get()
          .then(res => res.data())
        stop = { ...s, ...stop }
        stop.org = await getCollection('Organizations')
          .doc(stop.org_id)
          .get()
          .then(res => res.data())
        stop.location = await getCollection('Organizations')
          .doc(stop.org.id)
          .collection('Locations')
          .doc(stop.location_id)
          .get()
          .then(res => res.data())
        if (stop.type === 'pickup') {
          if (!startTime || startTime.toMillis() > stop.time_start.toMillis()) {
            setStartTime(stop.time_start)
          }
          if (!endTime || endTime.toMillis() < stop.time_end.toMillis()) {
            setEndTime(stop.time_end)
          }
        }
        updated_stops.push(stop)
      }
      setStops(updated_stops)
    }
    route.stops && updateStops()
  }, [route.stops]) // eslint-disable-line react-hooks/exhaustive-deps

  function isNextIncompleteStop(index) {
    if (
      stops[index].status === 9 ||
      stops[index].status === 0 ||
      route.status < 3
    )
      return false
    return (
      index === 0 ||
      stops[index - 1].status === 9 ||
      stops[index - 1].status === 0
    )
  }

  function areAllStopsCompleted() {
    let completed = true
    for (const s of stops) {
      // if stop is not completed or cancelled
      if (![0, 9].includes(s.status)) {
        completed = false
        break
      }
    }
    return completed
  }

  function hasEditPermissions() {
    return admin || user.uid === route.driver_id
  }

  function Driver() {
    return driver ? (
      <div id="Driver">
        <img src={driver.icon || UserIcon} alt={driver.name} />
        <div>
          <h3>{driver.name}</h3>
          <h4>{moment(route.time_start).format('dddd, MMMM D')}</h4>
          <h5>
            {moment(route.time_start).format('h:mma')} -{' '}
            {moment(route.time_end).format('h:mma')}
          </h5>
          {route.notes ? <p>Notes: "{route.notes}"</p> : null}
        </div>
      </div>
    ) : null
  }

  function StatusButton() {
    const [notes, setNotes] = useState('')

    function handleBegin() {
      getCollection('Routes').doc(route.id).set({ status: 3 }, { merge: true })
    }

    function handleComplete() {
      getCollection('Routes')
        .doc(route.id)
        .set({ status: 9, notes }, { merge: true })
    }

    if (willCancel || willDelete) return null
    if (route.status === 1) {
      return (
        <button className="blue" onClick={handleBegin}>
          begin route
        </button>
      )
    } else if (route.status === 3 && areAllStopsCompleted()) {
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
      ) : (
        <button className="blue" onClick={() => setWillComplete(true)}>
          finish route
        </button>
      )
    } else return null
  }

  function CancelButton() {
    const [notes, setNotes] = useState('')

    function handleCancel() {
      setWillCancel(false)
      getCollection('Routes')
        .doc(route.id)
        .set({ status: 0, notes }, { merge: true })
    }

    if (willComplete || willDelete || route.status === 0) return null
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

  function UpdateStop({ stop }) {
    function handleOnTheWay() {
      const collection = stop.type === 'pickup' ? 'Pickups' : 'Deliveries'
      getCollection(collection)
        .doc(stop.id)
        .set({ status: 3 }, { merge: true })
        .then(() => {
          window.open(generateDirectionsLink(stop.location), '_blank')
          window.location.reload()
        })
    }

    function handleOpenReport() {
      history.push(`/routes/${route_id}/${stop.type}/${stop.id}/report`)
    }

    if (route.status < 3) return null
    if (stop.status === 1) {
      return (
        <button className="update-stop" onClick={handleOnTheWay}>
          I'm on my way!
        </button>
      )
    }
    if (stop.status === 3) {
      return (
        <button className="update-stop" onClick={handleOpenReport}>
          Fill out {stop.type} report
        </button>
      )
    } else return null
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
        <section className="cancel-buttons">
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

  function StatusIndicator({ stop }) {
    if (stop.status === 9) {
      return <i id="StatusIndicator" className="fa fa-check" />
    } else if (stop.status === 0) {
      return <i id="StatusIndicator" className="fa fa-times" />
    } else if (stop.status === 3) {
      return <i id="StatusIndicator" className="fa fa-clock-o" />
    } else return null
  }

  function generateStatusHeader() {
    if (route.status === null || route.status === undefined) {
      return (
        <>
          Loading route
          <Ellipsis />
        </>
      )
    } else return `Route ${ROUTE_STATUSES[route.status].replace('_', ' ')}`
  }

  function StopNotes({ stop }) {
    return [1, 3].includes(stop.status) ? (
      <>
        {stop.location.upon_arrival_instructions ? (
          <h6>
            <span>Instructions: </span>
            {stop.location.upon_arrival_instructions}
          </h6>
        ) : null}
        {stop.location.contact_name ? (
          <h6>
            <span>Contact Name: </span>
            {stop.location.contact_name}
          </h6>
        ) : null}
        {stop.location.contact_phone ? (
          <h6>
            <span>Contact Phone:</span>
            <ExternalLink url={'tel:' + stop.location.contact_phone}>
              <p>{formatPhoneNumber(stop.location.contact_phone)}</p>
            </ExternalLink>
          </h6>
        ) : null}
      </>
    ) : [0, 9].includes(stop.status) && stop.report && stop.report.notes ? (
      <h6>
        <span>Notes: </span>
        {stop.report.notes}
      </h6>
    ) : null
  }

  return (
    <main id="Route">
      <GoBack url="/routes" label="back to routes" />
      <h1>{generateStatusHeader()}</h1>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Driver />
          {stops.length ? (
            <>
              <section className="Stops">
                {stops.map((s, i) => (
                  <div
                    className={`Stop ${s.type} ${
                      isNextIncompleteStop(i) ? 'active' : ''
                    }${areAllStopsCompleted(i) ? 'complete' : ''}`}
                    key={i}
                  >
                    <StatusIndicator stop={s} />
                    <h4>
                      <i
                        className={
                          s.type === 'pickup'
                            ? 'fa fa-arrow-up'
                            : 'fa fa-arrow-down'
                        }
                      />
                      {s.type}
                    </h4>
                    <h2>{s.org.name}</h2>
                    <ExternalLink url={generateDirectionsLink(s.location)}>
                      <p>
                        {s.location.address1}
                        {s.location.address2 && ` - ${s.location.address2}`}
                      </p>
                      <p>
                        {s.location.city}, {s.location.state}{' '}
                        {s.location.zip_code}
                      </p>
                    </ExternalLink>
                    <StopNotes stop={s} />
                    {hasEditPermissions() ? (
                      <>
                        {isNextIncompleteStop(i) ? (
                          <>
                            <UpdateStop stop={s} />
                            {s.status < 9 ? <CancelStop stop={s} /> : null}
                          </>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                ))}
              </section>

              <StatusButton />
              <CancelButton />
              <DeleteButton />
            </>
          ) : (
            <Loading text="Loading stops on route" relative />
          )}
        </>
      )}
    </main>
  )
}

export { Route }
