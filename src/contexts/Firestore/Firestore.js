import { createContext, useState } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { getCollection } from 'helpers'
import { useEffect } from 'react/cjs/react.development'

const FirestoreContext = createContext()
FirestoreContext.displayName = 'Firestore'

function Firestore({ children }) {
  const [Routes] = useCollectionData(getCollection('Routes'))
  const [Pickups] = useCollectionData(getCollection('Pickups'))
  const [Deliveries] = useCollectionData(getCollection('Deliveries'))
  const [Users] = useCollectionData(getCollection('Users').orderBy('name'))
  const [Organizations] = useCollectionData(
    getCollection('Organizations').orderBy('name')
  )
  const [Locations] = useCollectionData(
    getCollection('Locations').orderBy('name')
  )
  const [DirectDonations] = useCollectionData(getCollection('DirectDonations'))

  const [rescues_raw] = useCollectionData(
    getCollection('rescues').orderBy('timestamp_scheduled_start')
  )
  const [rescues, setRescues] = useState()

  const [wholesale_rescues] = useCollectionData(
    getCollection('wholesale_rescues').orderBy('timestamps.updated')
  )
  const [pickups] = useCollectionData(
    getCollection('pickups').orderBy('timestamp_updated')
  )
  const [deliveries] = useCollectionData(
    getCollection('deliveries').orderBy('timestamp_updated')
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
        const rescue_pickups = pickups.filter(p => p.rescue_id === r.id)
        const rescue_deliveries = deliveries.filter(d => d.rescue_id === r.id)
        for (const s of r.stop_ids) {
          let stop
          stop = rescue_pickups.find(p => p.id === s)
          if (stop) {
            stop.type = 'pickup'
          } else {
            stop = rescue_deliveries.find(d => d.id === s)
            stop.type = 'delivery'
          }
          if (!stop) stop = {}
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
      pickups &&
      pickups.length &&
      deliveries &&
      deliveries.length &&
      users &&
      users.length
    ) {
      populateCompleteRescueData()
    }
  }, [rescues_raw, organizations, locations, pickups, deliveries, users])

  return (
    <FirestoreContext.Provider
      value={{
        rescues,
        wholesale_rescues,
        pickups,
        deliveries,
        users,
        organizations,
        locations,
        Routes,
        Pickups,
        Deliveries,
        Users,
        Organizations,
        Locations,
        DirectDonations,
      }}
    >
      {children}
    </FirestoreContext.Provider>
  )
}
export { Firestore, FirestoreContext }
