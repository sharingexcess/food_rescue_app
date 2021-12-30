import React, { useEffect, useState } from 'react'
import { Input, Loading } from 'components'
import moment from 'moment'
import UserIcon from 'assets/user.svg'
import { Link, useLocation, useHistory } from 'react-router-dom'
import { useAuth, useFirestore } from 'hooks'
import { Card, Spacer, Text } from '@sharingexcess/designsystem'
import { STATUSES } from 'helpers'

export function Rescues() {
  const history = useHistory()
  const { user, admin } = useAuth()
  const location = useLocation()
  const rescues = useFirestore('rescues')
  const deliveries = useFirestore('deliveries')
  const [searchByDriver, setSearchByDriver] = useState('')
  const [searchByDate, setSearchByDate] = useState(
    moment(new Date()).format('yyyy-MM-DD')
  )
  const [filterByDriver, setFilterByDriver] = useState(false)
  const [filterByDate, setFilterByDate] = useState(false)
  const [filter, setFilter] = useState(admin ? 'active' : 'mine')
  const [isInitialRender, setIsInitialRender] = useState(true)

  useEffect(() => {
    // check if there are any "filter" query params
    // if there are, then setFilter("that parameter")
    const searchParams = new URLSearchParams(window.location.search)
    const filterSearchParam = searchParams.get('filter')
    if (filterSearchParam) {
      setFilter(filterSearchParam)
    }
    const driverSearchParam = searchParams.get('driver')
    if (driverSearchParam) {
      setSearchByDriver(driverSearchParam)
    }
    const dateSearchParam = searchParams.get('date')
    if (dateSearchParam) {
      setSearchByDate(dateSearchParam)
    }
  }, [])

  function getRescueWeight(rescue_id) {
    const rescue_deliveries = deliveries.filter(d => d.rescue_id === rescue_id)
    let totalWeight = 0
    for (const rd of rescue_deliveries) {
      totalWeight += rd.impact_data_total_weight || 0
    }
    return totalWeight
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const rootPath = window.location.pathname
    if (filter === 'driver') {
      params.set('filter', 'driver')
      if (searchByDriver) {
        params.set('driver', searchByDriver)
      }
      params.delete('date')
      history.replace(`${rootPath}?${params.toString()}`)
      setFilterByDriver(true)
      setFilterByDate(false)
    } else if (filter === 'date') {
      params.set('filter', 'date')
      if (searchByDate) {
        params.set('date', searchByDate)
      }
      params.delete('driver')
      history.replace(`${rootPath}?${params.toString()}`)
      setFilterByDriver(false)
      setFilterByDate(true)
    } else if (filter === 'mine') {
      history.replace(`${rootPath}?filter=mine`)
    } else if (filter === 'unassigned') {
      history.replace(`${rootPath}?filter=unassigned`)
    } else if (isInitialRender) {
      setIsInitialRender(false)
    } else {
      history.replace(`${rootPath}`)
      setFilterByDriver(false)
      setFilterByDate(false)
    }
  }, [filter]) // eslint-disable-line

  function handleSearchByDriver(e) {
    setSearchByDriver(e.target.value)
    history.replace(`history?filter=driver&driver=${e.target.value}`)
  }
  function handleSearchByDate(e) {
    setSearchByDate(e.target.value)
    history.replace(`history?filter=date&date=${e.target.value}`)
  }

  function filterAndSortRescues(rescues) {
    const byDate = (a, b) =>
      new Date(b.timestamp_scheduled_start) -
      new Date(a.timestamp_scheduled_start)

    switch (filter) {
      case 'active':
        return rescues
          .filter(r => ['scheduled', 'active'].includes(r.status))
          .sort(byDate)
      case 'past':
        return rescues
          .filter(r => ['completed', 'cancelled'].includes(r.status))
          .sort(byDate)
      case 'mine':
        return rescues.filter(r => r.handler_id === user.uid).sort(byDate)
      case 'unassigned':
        return rescues.filter(r => !r.handler_id).sort(byDate)
      case 'driver':
        return rescues
          .filter(
            r =>
              r.driver.name !== undefined &&
              r.driver.name.toLowerCase().includes(searchByDriver.toLowerCase())
          )
          .sort(byDate)
      case 'date':
        return rescues
          .filter(
            r =>
              moment(r.timestamp_scheduled_start).format('yyyy-MM-DD') ===
              searchByDate
          )
          .sort(byDate)
      default:
        return rescues.sort(byDate)
    }
  }

  function StatusIndicator({ rescue }) {
    if (rescue.status === STATUSES.COMPLETED) {
      return <div className="Rescues-route-status">✅</div>
    } else if (rescue.status === STATUSES.CANCELLED) {
      return <div className="Rescues-route-status">❌</div>
    } else if (rescue.status === STATUSES.SCHEDULED) {
      return <div className="Rescues-route-status">🗓</div>
    } else if (rescue.status === STATUSES.ACTIVE) {
      return <div className="Rescues-route-status">🚛</div>
    } else return null
  }

  function generateStopLabel(stop) {
    return `${stop.organization.name} (${
      stop.location.nickname || stop.location.address1
    })${stop.status === STATUSES.CANCELLED ? ' - Cancelled' : ''}`
  }

  function generateDeliveryWeight(delivery) {
    const baseText = `${delivery.organization.name} (${
      delivery.location.nickname || delivery.location.address1
    })`
    if (delivery.status === STATUSES.CANCELLED) {
      return `${baseText} - Cancelled`
    } else if (delivery.status === STATUSES.COMPLETED) {
      return `${baseText} - ${delivery.impact_data_total_weight} lbs.`
    } else return `${baseText}`
  }

  function generateRescueStart(rescue) {
    const start = rescue.timestamp_logged_start || 'No start time'

    if (rescue.status === STATUSES.COMPLETED) {
      return start === 'No start time' ? start : moment(start).format('h:mma')
    }
  }

  function generateRescueFinish(rescue) {
    const r_endTime = rescue.timestamp_logged_finish || 'No end time'

    if (rescue.status === STATUSES.COMPLETED) {
      return r_endTime === 'No end time'
        ? r_endTime
        : moment(r_endTime).format('h:mma')
    }
  }

  function RescueCard({ r }) {
    return (
      <Link to={`/rescues/${r.id}`} key={r.id}>
        <Card classList={['Route']}>
          <div className="Rescues-route-header">
            {r.driver && (
              <img src={r.driver.icon || UserIcon} alt={r.driver.name} />
            )}
            <div>
              <Text type="section-header" color="black" wrap={false}>
                {r.driver.name || 'Unassigned Route'}
              </Text>
              <Text type="small" color="blue">
                {r.status === STATUSES.COMPLETED
                  ? `${moment(r.timestamp_scheduled_start).format(
                      'ddd, MMM Do'
                    )}, ${generateRescueStart(r)} - ${generateRescueFinish(r)}`
                  : moment(r.timestamp_scheduled_start).format(
                      'ddd, MMM Do, h:mma'
                    )}
              </Text>
              {r.status === STATUSES.COMPLETED && (
                <>
                  <Spacer height={4} />
                  <Text type="small" color="green">
                    {getRescueWeight(r.id)} lbs. delivered
                  </Text>
                </>
              )}
            </div>
            <StatusIndicator rescue={r} />
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
  }

  return rescues ? (
    <main id="Rescues">
      <Text type="section-header" id="Rescues-title" color="white" shadow>
        Retail Rescues
      </Text>
      <Text type="subheader" color="white" shadow>
        Select a rescue to view pickup, delivery, and impact data.
      </Text>
      <Spacer height={32} />
      <section id="Filters">
        <select
          name="filters"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          {admin === true ? (
            <>
              <option value="active">Active Rescues&nbsp;&nbsp;&nbsp;⬇️</option>
              <option value="past">Past Rescues&nbsp;&nbsp;&nbsp;⬇️</option>
            </>
          ) : null}
          <option value="mine">My Rescues&nbsp;&nbsp;&nbsp;⬇️</option>
          <option value="unassigned">
            Available Rescues&nbsp;&nbsp;&nbsp;⬇️
          </option>
          {admin === true ? (
            <option value="driver">
              Rescues by Driver&nbsp;&nbsp;&nbsp;⬇️
            </option>
          ) : null}
          {admin === true ? (
            <option value="date">Rescues by Date&nbsp;&nbsp;&nbsp;⬇️</option>
          ) : null}
          {/*  Only adding these filters to Rescues page */}
          {location.pathname === '/routes' ? (
            <>
              {admin === true ? (
                <option value="incomplete">Show Incomplete Rescues</option>
              ) : null}
              {admin === true ? (
                <option value="happening">Show Ongoing Rescues</option>
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
      {!rescues.length ? (
        <Loading text="Loading rescues" />
      ) : !filterAndSortRescues(rescues).length ? (
        <div className="no-routes">
          <div className="icon">🤷‍♀️</div>
          <Text type="secondary-header" color="white" shadow align="center">
            No rescues found!
          </Text>
          <Spacer height={8} />
          <Text color="white" shadow align="center">
            We looked through the database and came up with...
            <br />
            well, nothin.
          </Text>
        </div>
      ) : (
        filterAndSortRescues(rescues).map(r => <RescueCard key={r.id} r={r} />)
      )}
    </main>
  ) : (
    <Loading />
  )
}