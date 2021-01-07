import React, { useEffect, useState } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import {
  getCollection,
  getImageFromStorage,
  isValidURL,
} from '../../helpers/helpers'
import Loading from '../Loading/Loading'
import moment from 'moment'
import UserIcon from '../../assets/user.svg'
import './Routes.scss'
import { Link } from 'react-router-dom'
import { GoBack } from '../../helpers/components'
import { useAuthContext } from '../Auth/Auth'

export default function Routes() {
  const { user } = useAuthContext()
  const [raw_routes] = useCollectionData(getCollection('Routes').limit(100))
  const [routes, setRoutes] = useState()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(true)

  useEffect(() => {
    async function addData() {
      const full_data = []
      for (const route of raw_routes) {
        for (const s of route.stops) {
          const collection = s.type === 'pickup' ? 'Pickups' : 'Deliveries'
          const stop = await getCollection(collection)
            .doc(s.id)
            .get()
            .then(res => res.data())
          Object.keys(stop).forEach(key => (s[key] = stop[key]))
          s.org = await getCollection('Organizations')
            .doc(stop.org_id)
            .get()
            .then(res => res.data())
        }
        if (route.driver_id) {
          const driver_ref = await getCollection('Users')
            .doc(route.driver_id)
            .get()
          const driver = driver_ref.data()
          if (driver.icon && !isValidURL(driver.icon)) {
            driver.icon = await getImageFromStorage(driver.icon)
          }
          route.driver = driver
        }
        full_data.push(route)
      }
      setRoutes(full_data)
      setLoading(false)
    }
    raw_routes && addData()
  }, [raw_routes])

  function filterAndSortRoutes(routes) {
    return filter
      ? routes
          .filter(r => r.driver_id === user.uid)
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
      : routes.sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
  }

  return (
    <main id="Routes">
      <GoBack label="back" url="/" />
      <h1>
        Routes
        <button className="secondary" onClick={() => setFilter(!filter)}>
          {filter ? 'Show All Routes' : 'Show My Routes'}
        </button>
      </h1>
      {loading ? (
        <Loading text="Loading routes" />
      ) : !routes.length ? (
        <p className="no-routes">No routes scheduled.</p>
      ) : (
        filterAndSortRoutes(routes).map(r => (
          <Link to={`/routes/${r.id}`} key={r.id}>
            <div className="Route">
              {r.driver && (
                <img src={r.driver.icon || UserIcon} alt={r.driver.name} />
              )}
              <div>
                <h3>{r.driver.name}</h3>
                <h4>{moment(r.time_start).format('dddd, MMMM Do')}</h4>
                <h5>
                  {moment(r.time_start).format('h:mma')} -{' '}
                  {moment(r.time_end).format('h:mma')}{' '}
                </h5>
                <p className="pickups">
                  <i className="fa fa-arrow-up" />
                  {r.stops
                    .filter(s => s.type === 'pickup')
                    .map(s => s.org.name)
                    .join(', ')}
                </p>
                <p className="deliveries">
                  <i className="fa fa-arrow-down" />
                  {r.stops
                    .filter(s => s.type === 'delivery')
                    .map(s => s.org.name)
                    .join(', ')}
                </p>
              </div>
            </div>
          </Link>
        ))
      )}
    </main>
  )
}
