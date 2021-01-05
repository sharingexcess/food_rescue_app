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

export default function Routes() {
  const [raw_routes = []] = useCollectionData(getCollection('Routes'))
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function addData() {
      const full_data = []
      for (const route of raw_routes) {
        for (const s of route.stops) {
          const collection = s.type === 'pickup' ? 'Pickups' : 'Deliveries'
          const stop_ref = await getCollection(collection).doc(s.id).get()
          const stop = stop_ref.data()
          Object.keys(stop).forEach(key => (s[key] = stop[key]))

          if (s.type === 'pickup') {
            if (
              !route.start_time ||
              route.start_time.toMillis() > s.time_start.toMillis()
            ) {
              route.start_time = s.time_start
            }
            if (
              !route.end_time ||
              route.end_time.toMillis() < s.time_end.toMillis()
            ) {
              route.end_time = s.time_end
            }
          }
          const org_ref = await getCollection('Organizations')
            .doc(stop.org_id)
            .get()
          s.org = org_ref.data()
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
    raw_routes.length && addData()
  }, [raw_routes])

  return (
    <main id="Routes">
      <h1>Routes</h1>
      {loading ? (
        <Loading text="Loading routes" />
      ) : (
        routes.map(r => (
          <Link to={`/routes/${r.id}`} key={r.id}>
            <div className="Route">
              {r.driver && (
                <img src={r.driver.icon || UserIcon} alt={r.driver.name} />
              )}
              <div>
                <h3>{r.driver.name}</h3>
                <h4>
                  {moment(r.start_time.toDate()).format('ddd, MMMM Do YYYY')}
                </h4>
                <h5>
                  {moment(r.start_time.toDate()).format('h:mma')} -{' '}
                  {moment(r.end_time.toDate()).format('h:mma')}{' '}
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
