import React, { useEffect, useState } from 'react'
import { getImageFromStorage, isValidURL } from 'helpers'
import { Input, Loading } from 'components'
import moment from 'moment'
import UserIcon from 'assets/user.svg'
import { Link, useLocation } from 'react-router-dom'
import { useAuth, useFirestore } from 'hooks'
import { Button, Card, Spacer, Text } from '@sharingexcess/designsystem'

export function Routes({ initial_filter }) {
  const { user, admin } = useAuth()
  const locations = useFirestore('locations')
  const location = useLocation()
  const raw_routes = useFirestore('routes')
  const pickups = useFirestore('pickups')
  const deliveries = useFirestore('deliveries')
  const organizations = useFirestore('organizations')
  const users = useFirestore('users')
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
    raw_routes && addData() // eslint-disable-next-line
  }, [
    raw_routes,
    pickups,
    deliveries,
    organizations,
    users,
    location,
    locations,
  ])

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
      return <div className="Routes-route-status">✅</div>
    } else if (route.status === 0) {
      return <div className="Routes-route-status">❌</div>
    } else if (route.status === 1) {
      return <div className="Routes-route-status">🗓</div>
    } else if (route.status === 3) {
      return <div className="Routes-route-status">🚛</div>
    } else return null
  }

  function generateStopLabel(stop) {
    if (stop.status === 0) {
      return `${stop.org.name} (${
        stop.location.name || stop.location.address1
      }) - Cancelled`
    } else {
      return `${stop.org.name} (${
        stop.location.name || stop.location.address1
      })`
    }
  }

  function generateDeliveryWeight(delivery) {
    if (delivery.status === 0) {
      return `${delivery.org.name} (${
        delivery.location.name || delivery.location.address1
      }) - Cancelled`
    } else if (delivery.status === 9) {
      if (delivery.report) {
        if (delivery.report.weight) {
          return `${delivery.org.name} (${
            delivery.location.name || delivery.location.address1
          }) - ${delivery.report.weight} lbs.`
        } else {
          return `${delivery.org.name} (${
            delivery.location.name || delivery.location.address1
          }) - 0 lbs.`
        }
      } else {
        return `${delivery.org.name} (${
          delivery.location.name || delivery.location.address1
        }) - 0 lbs.`
      }
    } else {
      return `${delivery.org.name} (${
        delivery.location.name || delivery.location.address1
      })`
    }
  }

  function generateRouteStart(route) {
    const r_startTime = route.time_started
      ? route.time_started.toDate()
      : 'Not found'

    if (route.status === 9) {
      return `Start Time: ${
        r_startTime === 'Not found'
          ? r_startTime
          : moment(r_startTime).format('h:mma')
      }`
    }
  }

  function generateRouteStop(route) {
    const r_endTime = route.time_finished
      ? route.time_finished.toDate()
      : 'Not found'

    if (route.status === 9) {
      return `End Time: ${
        r_endTime === 'Not found'
          ? r_endTime
          : moment(r_endTime).format('h:mma')
      }`
    }
  }

  return routes ? (
    <main id="Routes">
      <Text type="section-header" color="white" align="center">
        {location.pathname === '/routes'
          ? 'Viewing Current Routes'
          : 'Viewing Past Routes'}
      </Text>
      <Spacer height={32} />
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
          <div className="icon">👍</div>
          <Text type="secondary-header" color="white" shadow align="center">
            {location.pathname === '/routes'
              ? 'Schedule is clear!'
              : 'History is empty!'}
          </Text>
          <Spacer height={16} />
          {admin ? (
            <Link to="/">
              <Button>Back to Home Page</Button>
            </Link>
          ) : null}
        </div>
      ) : (
        filterAndSortRoutes(routes).map(r => {
          console.log(r.time_started ? r.time_started.toDate() : 'Not found')
          return (
            <Link
              to={
                location.pathname === '/routes'
                  ? `/routes/${r.id}`
                  : `/history/${r.id}`
              }
              key={r.id}
            >
              <Card
                classList={[
                  'Route',
                  [0, 9].includes(r.status) && location.pathname === '/routes'
                    ? ' complete'
                    : '',
                ]}
              >
                <div className="Routes-route-header">
                  {r.driver && (
                    <img src={r.driver.icon || UserIcon} alt={r.driver.name} />
                  )}
                  <div>
                    <Text type="section-header" color="black" wrap={false}>
                      {r.driver.name || 'Unassigned Route'}
                    </Text>
                    <Text type="small" color="blue">
                      {moment(r.time_start).format('ddd, MMM Do, h:mma')}
                    </Text>
                    <Text type="small" color="blue">
                      {generateRouteStart(r)}
                      <br></br>
                      {generateRouteStop(r)}
                    </Text>
                    {r.status === 9 && (
                      <>
                        <Spacer height={4} />
                        <Text type="small" color="green">
                          {getRouteWeight(r.id)} lbs. delivered
                        </Text>
                      </>
                    )}
                  </div>
                  <StatusIndicator route={r} />
                </div>
                <Spacer height={12} />
                <Text type="small" color="grey" classList={['pickups']}>
                  🟩{'  '}
                  {r.stops
                    .filter(s => s.type === 'pickup')
                    .map(stop => generateStopLabel(stop))
                    .join('\n')}
                </Text>
                <Spacer height={8} />
                <Text type="small" color="grey" classList={['deliveries']}>
                  🟥{'  '}
                  {r.stops
                    .filter(s => s.type === 'delivery')
                    .map(s => generateDeliveryWeight(s))
                    .join('\n')}
                </Text>
                {r.notes ? (
                  <h6>
                    <span>Notes: </span>
                    {r.notes}
                  </h6>
                ) : null}
              </Card>
            </Link>
          )
        })
      )}
    </main>
  ) : (
    <Loading />
  )
}
