import React, { useEffect, useState } from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { getCollection, formatPhoneNumber } from '../../helpers/helpers'
import Loading from '../Loading/Loading'
import moment from 'moment'
import UserIcon from '../../assets/user.svg'
import './Route.scss'
import { Link, useHistory, useParams } from 'react-router-dom'
import { ExternalLink, GoBack } from '../../helpers/components'
import { generateDirectionsLink } from './utils'

function Route() {
  const history = useHistory()
  const { route_id } = useParams()
  const [route = {}, loading] = useDocumentData(
    getCollection('Routes').doc(route_id)
  )
  const [stops, setStops] = useState([])
  const [startTime, setStartTime] = useState()
  const [endTime, setEndTime] = useState()
  const [driver = {}] = useDocumentData(
    route.driver_id ? getCollection('Users').doc(route.driver_id) : null
  )
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

  async function handleDeleteRoute() {
    const request = window.gapi.client.calendar.events.delete({
      calendarId: process.env.REACT_APP_GOOGLE_CALENDAR_ID,
      eventId: route.google_calendar_event_id,
    })
    request.execute()
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
        </div>
      </div>
    ) : null
  }

  return (
    <main id="Route">
      <GoBack url="/routes" label="back to routes" />
      <h1>Scheduled Route</h1>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Driver />
          {stops.length ? (
            <>
              {stops.map((s, i) => (
                <div className={`Stop ${s.type}`} key={i}>
                  <div>
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
                    {s.location.upon_arrival_instructions ? (
                      <h6>
                        <span>Arrival Instructions: </span>
                        {s.location.upon_arrival_instructions}
                      </h6>
                    ) : null}
                    {s.location.contact_name ? (
                      <h6>
                        <span>Contact Name: </span>
                        {s.location.contact_name}
                      </h6>
                    ) : null}
                    {formatPhoneNumber(s.location.contact_phone) ? (
                      <h6>
                        <span>Contact Phone:</span>
                        <ExternalLink url={'tel:' + s.location.contact_phone}>
                          <p>{formatPhoneNumber(s.location.contact_phone)}</p>
                        </ExternalLink>
                      </h6>
                    ) : null}
                  </div>
                  {i === 0 ||
                  (stops[i - 1].report &&
                    Object.keys(stops[i - 1].report).length) ? (
                    <Link to={`/routes/${route_id}/${s.type}/${s.id}/report`}>
                      <button
                        className={
                          s.report && Object.keys(s.report).length
                            ? 'complete'
                            : 'incomplete'
                        }
                      >
                        <i
                          className={
                            s.report && Object.keys(s.report).length
                              ? 'fa fa-check'
                              : 'fa fa-file'
                          }
                        />
                      </button>
                    </Link>
                  ) : null}
                </div>
              ))}
              {willDelete ? (
                <button className="delete" onClick={handleDeleteRoute}>
                  are you sure you want to delete?
                </button>
              ) : (
                <button className="delete" onClick={() => setWillDelete(true)}>
                  delete route
                </button>
              )}
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
