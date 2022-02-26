import { createContext, useEffect, useMemo, useState } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import {
  DEFAULT_DB_LIMIT,
  FIRST_RESCUE_IN_DB,
  getCollection,
  initFirestoreListener,
} from 'helpers'
import moment from 'moment'

const FirestoreContext = createContext()
FirestoreContext.displayName = 'Firestore'

function Firestore({ children }) {
  const [limit, setLimit] = useState(DEFAULT_DB_LIMIT)
  const [data, setData] = useState({
    rescues: [],
    stops: [],
    organizations: [],
    locations: [],
    users: [],
  })

  useEffect(() => {
    initFirestoreListener(
      getCollection('rescues')
        .where('timestamp_scheduled_start', '>=', limit)
        .orderBy('timestamp_scheduled_start', 'desc'),
      payload => setData(data => ({ ...data, rescues: payload }))
    )
  }, [limit])

  const stops_query = useMemo(
    () =>
      getCollection('stops')
        .where('timestamp_scheduled_start', '>=', limit)
        .orderBy('timestamp_scheduled_start', 'desc'),
    [limit]
  )
  initFirestoreListener(stops_query, payload =>
    setData(data => ({ ...data, stops: payload }))
  )

  const organizations_query = getCollection('organizations').orderBy('name')
  initFirestoreListener(organizations_query, payload =>
    setData(data => ({ ...data, organizations: payload }))
  )

  const [locations] = useCollectionData(
    getCollection('locations').orderBy('id')
  )
  const [users] = useCollectionData(getCollection('users').orderBy('name'))

  useEffect(() => {
    async function populateCompleteRescueData() {
      const full_data = []
      for (const rescue of rescues_raw) {
        const r = { ...rescue, stops: [] }
        const rescue_stops = stops.filter(i => i.rescue_id === r.id)
        for (const s of r.stop_ids) {
          const stop = rescue_stops.find(i => i.id === s) || {}
          stop.organization =
            organizations.find(o => o.id === stop.organization_id) || {}
          stop.location = locations.find(l => l.id === stop.location_id) || {}
          r.stops.push(stop)
        }
        r.driver = users.find(u => u.id === r.handler_id) || {}
        full_data.push(r)
      }
      setRescues(full_data)
    }
    if (
      rescues_raw &&
      rescues_raw.length &&
      organizations &&
      organizations.length &&
      locations &&
      locations.length &&
      stops &&
      stops.length &&
      users &&
      users.length
    ) {
      populateCompleteRescueData()
    }
  }, [rescues_raw, organizations, locations, stops, users])

  function resetLimit() {
    setLimit(DEFAULT_DB_LIMIT)
  }

  function loadMoreData() {
    setLimit(moment(limit).subtract(1, 'month').startOf('month').toDate())
  }

  function loadAllData() {
    // To view all data, we move the time limit back arbitrarily far
    setLimit(moment(limit).subtract(10, 'years').toDate())
  }

  const loadedAllData = useMemo(() => {
    // no data exists before 2018
    // we check to see that the limit is before 2018,
    // and that the oldest known rescue in the DB
    // has in fact been loaded
    if (
      limit < new Date('2018-1-1') &&
      rescues &&
      rescues.length &&
      rescues.find(r => r.id === FIRST_RESCUE_IN_DB)
    ) {
      return true
    } else return false
  }, [limit, rescues])

  return (
    <FirestoreContext.Provider
      value={{
        stops,
        rescues,
        users,
        organizations,
        locations,
        resetLimit,
        loadMoreData,
        loadAllData,
        loadedAllData,
      }}
    >
      {children}
    </FirestoreContext.Provider>
  )
}
export { Firestore, FirestoreContext }
