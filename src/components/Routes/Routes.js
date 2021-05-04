import React, { useEffect, useState } from 'react'
import { getImageFromStorage, isValidURL } from '../../helpers/helpers'
import Loading from '../Loading/Loading'
import { Input } from '../Input/Input'
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
import RouteHeader from '../RoutesHeader/RoutesHeaders'
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
  const [searchByDriver, setSearchByDriver] = useState('')
  const [searchByDate, setSearchByDate] = useState(
    moment(new Date()).format('yyyy-MM-DD')
  )
  const [filterByDriver, setFilterByDriver] = useState(false)
  const [filterByDate, setFilterByDate] = useState(false)
  const [filter, setFilter] = useState(admin ? 'all' : 'mine')

  function getDeliveryWeight(routeId) {
    const myDelivery = deliveries.find(
      deliveryRoute => deliveryRoute.route_id === routeId
    )
    return myDelivery ? myDelivery.report?.weight : 0
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
    console.log(e.target.value)
    console.log(routes.map(r => r.time_start.substring(0, 10)))
  }
  function filterAndSortRoutes(routes) {
    // filter routes by date before rendering them
    const routesToDisplay = admin
      ? routes
      : routes.filter(route => new Date(route.time_start) <= new Date())

    return filter === 'mine'
      ? routesToDisplay
          .filter(r => r.driver_id === user.uid)
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
          .sort((a, b) => new Date(a.time_start) - Date.now())
      : filter === 'unassigned'
      ? routesToDisplay
          .filter(r => r.driver.name === undefined)
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
          .sort((a, b) => new Date(a.time_start) - Date.now())
      : filter === 'incomplete'
      ? routesToDisplay
          .filter(r => r.status === 1)
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
          .sort((a, b) => new Date(a.time_start) - Date.now())
      : filter === 'happening'
      ? routesToDisplay
          .filter(r => r.status === 3)
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
          .sort((a, b) => new Date(a.time_start) - Date.now())
      : filter === 'driver'
      ? routesToDisplay
          .filter(
            r =>
              r.driver.name !== undefined &&
              r.driver.name.toLowerCase().includes(searchByDriver.toLowerCase())
          )
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
          .sort((a, b) => new Date(a.time_start) - Date.now())
      : filter === 'date'
      ? routesToDisplay
          .filter(r => r.time_start.substring(0, 10) === searchByDate)
          .sort((a, b) => new Date(b.time_start) - new Date(a.time_start))
          .sort((a, b) => new Date(a.time_start) - Date.now())
      : routesToDisplay
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
      <Header text={location.pathname === '/routes' ? 'Routes' : 'History'} />
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
          <option value="all">Show All Routes</option>
          <option value="mine">Show My Routes</option>
          <option value="unassigned">Show Unassigned Routes</option>
          <option value="driver">Show Routes by Driver</option>
          <option value="date">Show Routes by Date</option>
          {/*  Only adding these filters to Routes page */}
          {location.pathname === '/routes' ? (
            <>
              <option value="incomplete">Show Incomplete Routes</option>
              <option value="happening">Show Ongoing Routes</option>
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
        filterAndSortRoutes(routes).map(r => (
          <Link
            target="_blank"
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
                    <span> - {getDeliveryWeight(r.id)} lbs.</span>
                  )}
                </h2>
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
