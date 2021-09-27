import React, { useEffect, useState } from 'react'
import { getImageFromStorage, isValidURL } from '../../helpers/helpers'
import { Input, Loading, RouteHeader } from 'components'
import moment from 'moment'
import UserIcon from '../../assets/user.svg'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from 'contexts'
import {
  useLocationData,
  useDeliveryData,
  useRouteData,
  useUserData,
  usePickupData,
  useOrganizationData,
} from 'hooks'

export function Routes({ initial_filter }) {
  const { user, admin } = useAuth()
  const locations = useLocationData()
  const location = useLocation()
  const raw_routes = useRouteData()
  const pickups = usePickupData()
  const deliveries = useDeliveryData()
  const organizations = useOrganizationData()
  const users = useUserData()
  const [routes, setRoutes] = useState()
  const [loading, setLoading] = useState(true)
  const [searchByDriver, setSearchByDriver] = useState('')
  const [searchByDate, setSearchByDate] = useState(
    moment(new Date()).format('yyyy-MM-DD')
  )
  const [filterByDriver, setFilterByDriver] = useState(false)
  const [filterByDate, setFilterByDate] = useState(false)
  const [filter, setFilter] = useState(admin ? 'all' : 'mine')
  function getRouteWeight(routeId) {
    const deliveredWeight = deliveries.filter(r => r.route_id === routeId)
    let totalWeight = 0
    for (let i = 0; i < deliveredWeight.length; i++) {
      totalWeight += deliveredWeight[i].report?.weight
        ? deliveredWeight[i].report?.weight
        : 0
    }
    return totalWeight
  }
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
          s.location = locations.find(l => l.id === s.location_id) || {}
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
  }, [raw_routes, pickups, deliveries, organizations, users, location]) // eslint-disable-line
  useEffect(() => {
    if (filter === 'driver') {
      setFilterByDriver(true)
      setFilterByDate(false)
    } else if (filter === 'date') {
      setFilterByDriver(false)
      setFilterByDate(true)
    } else {
      setFilterByDriver(false)
      setFilterByDate(false)
    }
  }, [filter])
  function handleSearchByDriver(e) {
    setSearchByDriver(e.target.value)
  }
  function handleSearchByDate(e) {
    setSearchByDate(e.target.value)
  }
  function filterAndSortRoutes(routes) {
    return filter === 'mine'
      ? routes
          .filter(r => r.driver_id === user.uid)
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
          .sort((a, b) => new Date(a.time_start) - Date.now())
      : filter === 'unassigned'
      ? routes
          .filter(r => r.driver.name === undefined)
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
          .sort((a, b) => new Date(a.time_start) - Date.now())
      : filter === 'incomplete'
      ? routes
          .filter(r => r.status === 1)
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
          .sort((a, b) => new Date(a.time_start) - Date.now())
      : filter === 'happening'
      ? routes
          .filter(r => r.status === 3)
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
          .sort((a, b) => new Date(a.time_start) - Date.now())
      : filter === 'driver'
      ? routes
          .filter(
            r =>
              r.driver.name !== undefined &&
              r.driver.name.toLowerCase().includes(searchByDriver.toLowerCase())
          )
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
          .sort((a, b) => new Date(a.time_start) - Date.now())
      : filter === 'date'
      ? routes
          .filter(r => r.time_start.substring(0, 10) === searchByDate)
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
          .sort((a, b) => new Date(a.time_start) - Date.now())
      : routes
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
          .sort((a, b) => new Date(a.time_start) - Date.now())
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
      <RouteHeader
        text={
          location.pathname === '/routes'
            ? 'Viewing Current Routes'
            : 'Viewing Past Routes'
        }
      />
      <section id="Filters">
        <select
          name="filters"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          {admin === true ? <option value="all">Show All Routes</option> : null}
          <option value="mine">Show My Routes</option>
          <option value="unassigned">Show Unassigned Routes</option>
          {admin === true ? (
            <option value="driver">Show Routes by Driver</option>
          ) : null}
          {admin === true ? (
            <option value="date">Show Routes by Date</option>
          ) : null}
          {/*  Only adding these filters to Routes page */}
          {location.pathname === '/routes' ? (
            <>
              {admin === true ? (
                <option value="incomplete">Show Incomplete Routes</option>
              ) : null}
              {admin === true ? (
                <option value="happening">Show Ongoing Routes</option>
              ) : null}
            </>
          ) : null}
        </select>
      </section>
      {filterByDriver ? (
        <Input
          label="Filter Route by Driver Name"
          onChange={handleSearchByDriver}
          value={searchByDriver}
          animation={false}
        />
      ) : null}
      {filterByDate ? (
        <Input
          label="Filter Route by Date"
          type="date"
          onChange={handleSearchByDate}
          value={searchByDate}
          animation={false}
        />
      ) : null}
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
        filterAndSortRoutes(routes).map(r => {
          const r_pickups = pickups.filter(p => p.route_id === r.id)
          const r_deliveries = deliveries.filter(de => de.route_id === r.id)
          const r_starttime_array = r_pickups.map(p => p.time_finished)
          const r_starttime = r_starttime_array[0]
            ? r_starttime_array[0].toDate()
            : 'Not found'
          const r_endtime_array = r_deliveries.map(de => de.time_finished)
          const r_endtime = r_endtime_array[r_endtime_array.length - 1]
            ? r_endtime_array[r_endtime_array.length - 1].toDate()
            : 'Not found'
          return (
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
                  <h2>
                    {r.driver.name || 'Unassigned Route'}
                    {r.status === 9 && (
                      <span> - {getRouteWeight(r.id)} lbs.</span>
                    )}
                  </h2>
                  <h4>{moment(r.time_start).format('dddd, MMMM Do')}</h4>
                  {location.pathname === '/routes' ? (
                    <h5>
                      {moment(r.time_start).format('h:mma')} {' - '}
                      {moment(r.time_end).format('h:mma')}{' '}
                    </h5>
                  ) : (
                    <h5>
                      {r_starttime === 'Not found'
                        ? r_starttime
                        : moment(r_starttime).format('h:mma')}{' '}
                      {' - '}
                      {r_endtime === 'Not found'
                        ? r_endtime
                        : moment(r_endtime).format('h:mma')}{' '}
                    </h5>
                  )}
                  <p className="pickups">
                    <i className="fa fa-arrow-up" />
                    {r.stops
                      .filter(s => s.type === 'pickup')
                      .map(s =>
                        s.location.name
                          ? s.org.name +
                            ` (${s.location.name})` +
                            `${location.pathname === '/history' ? ' : ' : ''}` +
                            `${
                              location.pathname === '/history'
                                ? s.report?.weight?.toString() + 'lbs'
                                : ''
                            }`
                          : s.org.name
                      )
                      .join(', ')}
                  </p>
                  <p className="deliveries">
                    <i className="fa fa-arrow-down" />
                    {r.stops
                      .filter(s => s.type === 'delivery')
                      .map(s =>
                        s.location.name
                          ? s.org.name +
                            ` (${s.location.name})` +
                            `${location.pathname === '/history' ? ' : ' : ''}` +
                            `${
                              location.pathname === '/history'
                                ? s.report?.weight?.toString() + 'lbs'
                                : ''
                            }`
                          : s.org.name
                      )
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
          )
        })
      )}
    </main>
  )
}
