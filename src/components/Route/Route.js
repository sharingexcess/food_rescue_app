import React, { useEffect, useState } from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { getCollection } from '../../helpers/helpers'
import Loading from '../Loading/Loading'
import moment from 'moment'
import UserIcon from '../../assets/user.svg'
import './Route.scss'
import { Link, useParams } from 'react-router-dom'
import { ExternalLink, GoBack } from '../../helpers/components'
import { generateDirectionsLink } from './utils'

function Route() {
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
  }, [route.stops])

  function Driver() {
    return driver ? (
      <div id="Driver">
        <img src={driver.icon || UserIcon} alt={driver.name} />
        <div>
          <h3>{driver.name}</h3>
          {startTime && endTime ? (
            <h4>
              {moment(startTime.toDate()).format('h:mma')} -{' '}
              {moment(endTime.toDate()).format('h:mma')}
            </h4>
          ) : null}
        </div>
      </div>
    ) : null
  }

  return (
    <main id="Route">
      <GoBack url="/routes" label="back to routes" />
      <h1>Route #{route_id.split('-')[0].toUpperCase()}</h1>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Driver />
          {stops.length ? (
            stops.map((s, i) => (
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
                </div>
                <Link to={`/routes/${route_id}/${s.type}/${s.id}/report`}>
                  <button>
                    <i className="fa fa-file" />
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <Loading text="Loading stops on route" relative />
          )}
        </>
      )}
    </main>
  )
}

export { Route }
