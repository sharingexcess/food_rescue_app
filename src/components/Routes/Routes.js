import React, { useEffect, useState } from 'react'
import { getImageFromStorage, isValidURL } from '../../helpers/helpers'
import Loading from '../Loading/Loading'
import moment from 'moment'
import UserIcon from '../../assets/user.svg'
import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '../Auth/Auth'
import useRouteData from '../../hooks/useRouteData'
import usePickupData from '../../hooks/usePickupData'
import useDeliveryData from '../../hooks/useDeliveryData'
import useOrganizationData from '../../hooks/useOrganizationData'
import useUserData from '../../hooks/useUserData'
import Header from '../Header/Header'
import './Routes.scss'

export default function Routes({ initial_filter }) {
  const { user, admin } = useAuthContext()
  const location = useLocation()
  const raw_routes = useRouteData()
  const pickups = usePickupData()
  const deliveries = useDeliveryData()
  const organizations = useOrganizationData()
  const users = useUserData()
  const [routes, setRoutes] = useState()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(admin ? 'all' : 'mine')

  useEffect(() => {
    async function addData() {
      const full_data = []
      for (const route of raw_routes.filter(initial_filter)) {
        for (const s of route.stops) {
          const stop =
            s.type === 'pickup'
              ? pickups.find(p => p.id === s.id) || {}
              : deliveries.find(d => d.id === s.id) || {}
          Object.keys(stop).forEach(key => (s[key] = stop[key]))
          s.org = organizations.find(o => o.id === s.org_id) || {}
        }
        route.driver = users.find(u => u.id === route.driver_id) || {}
        if (route.driver.icon && !isValidURL(route.driver.icon)) {
          route.driver.icon = await getImageFromStorage(route.driver.icon)
        }
        full_data.push(route)
      }
      setRoutes(full_data)
      setLoading(false)
    }
    raw_routes && addData()
  }, [raw_routes, pickups, deliveries, organizations, users, location]) // eslint-disable-line react-hooks/exhaustive-deps

  function filterAndSortRoutes(routes) {
    return filter === 'mine'
      ? routes
          .filter(r => r.driver_id === user.uid)
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
      : filter === 'incomplete'
      ? routes
          .filter(r => r.status === 1)
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
      : filter === 'happening'
      ? routes
          .filter(r => r.status === 3)
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
      : routes.sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
  }

  function StatusIndicator({ route }) {
    if (route.status === 9) {
      return <i id="StatusIndicator" className="fa fa-check" />
    } else if (route.status === 0) {
      return <i id="StatusIndicator" className="fa fa-times" />
    } else if (route.status === 3) {
      return <i id="StatusIndicator" className="fa fa-clock-o" />
    } else return null
  }

  return (
    <main id="Routes">
      <Header text={location.pathname === '/routes' ? 'Routes' : 'History'} />
      <section id="Filters">
        <select
          name="filters"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">Show All Routes</option>
          <option value="mine">Show My Routes</option>
          {/*  Only adding these filters to Routes page */}
          {location.pathname === '/routes' ? (
            <>
              <option value="incomplete">Show Incomplete routes</option>
              <option value="happening">Show Ongoing routes</option>
            </>
          ) : null}
        </select>
      </section>
      {loading ? (
        <Loading text="Loading routes" />
      ) : !filterAndSortRoutes(routes).length ? (
        <div className="no-routes">
          <i className="fa fa-check" />
          <p>
            {location.pathname === '/routes'
              ? 'Schedule is clear!'
              : 'History is empty!'}
          </p>
          {admin ? (
            <Link to="/admin/create-route">
              <button>schedule a new route</button>
            </Link>
          ) : null}
        </div>
      ) : (
        filterAndSortRoutes(routes).map(r => (
          <Link
            to={
              location.pathname === '/routes'
                ? `/routes/${r.id}`
                : `/history/${r.id}`
            }
            key={r.id}
          >
            <div
              className={`Route${
                [0, 9].includes(r.status) && location.pathname === '/routes'
                  ? ' complete'
                  : ''
              }`}
            >
              {r.driver && (
                <img src={r.driver.icon || UserIcon} alt={r.driver.name} />
              )}
              <div>
                <StatusIndicator route={r} />
                <h2>{r.driver.name || 'Unassigned Route'}</h2>
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
                {r.notes ? (
                  <h6>
                    <span>Notes: </span>
                    {r.notes}
                  </h6>
                ) : null}
              </div>
            </div>
          </Link>
        ))
      )}
    </main>
  )
}
