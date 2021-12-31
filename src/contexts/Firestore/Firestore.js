import { createContext, useEffect, useMemo, useState } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { getCollection } from 'helpers'
import moment from 'moment'

const FirestoreContext = createContext()
FirestoreContext.displayName = 'Firestore'

function Firestore({ children }) {
  const [limit, setLimit] = useState(moment().subtract(7, 'days').toDate())
  const [rescues, setRescues] = useState()
  const rescuesQuery = useMemo(
    () =>
      getCollection('rescues')
        .where('timestamp_scheduled_start', '>=', limit)
        .orderBy('timestamp_scheduled_start', 'desc'),
    [limit]
  )
  const [rescues_raw] = useCollectionData(rescuesQuery)

  const stopsQuery = useMemo(
    () =>
      getCollection('stops')
        .where('timestamp_scheduled_start', '>=', limit)
        .orderBy('timestamp_scheduled_start', 'desc'),
    [limit]
  )
  const [stops] = useCollectionData(stopsQuery)
  const [organizations] = useCollectionData(
    getCollection('organizations').orderBy('name')
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

  function loadMoreData() {
    setLimit(moment(limit).subtract(1, 'month').startOf('month').toDate())
  }

  function loadAllData() {
    // To view all data, we move the time limit back arbitrarily far
    setLimit(moment(limit).subtract(10, 'years').toDate())
  }

  const loadedAllData = useMemo(() => {
    // no data exists before 2018
    return limit < new Date('2018-1-1')
  }, [limit])

  return (
    <FirestoreContext.Provider
      value={{
        stops,
        rescues,
        users,
        organizations,
        locations,
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
