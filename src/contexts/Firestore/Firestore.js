import { createContext, useState } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { getCollection } from 'helpers'
import { useEffect } from 'react/cjs/react.development'

const FirestoreContext = createContext()
FirestoreContext.displayName = 'Firestore'

function Firestore({ children }) {
  const [rescues_raw] = useCollectionData(
    getCollection('rescues').orderBy('timestamp_scheduled_start')
  )
  const [rescues, setRescues] = useState()
  const [stops] = useCollectionData(
    getCollection('stops').orderBy('timestamp_updated')
  )
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

  return (
    <FirestoreContext.Provider
      value={{
        rescues,
        stops,
        users,
        organizations,
        locations,
      }}
    >
      {children}
    </FirestoreContext.Provider>
  )
}
export { Firestore, FirestoreContext }
