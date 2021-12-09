import { createContext, useState } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { getCollection, getImageFromStorage, isValidURL } from 'helpers'
import { useEffect } from 'react/cjs/react.development'

const FirestoreContext = createContext()
FirestoreContext.displayName = 'Firestore'

function Firestore({ children }) {
  // const [routes] = useCollectionData(getCollection('Routes'))
  // const [pickups] = useCollectionData(getCollection('Pickups'))
  // const [deliveries] = useCollectionData(getCollection('Deliveries'))
  // const [users] = useCollectionData(getCollection('Users').orderBy('name'))
  // const [organizations] = useCollectionData(
  //   getCollection('Organizations').orderBy('name')
  // )
  // const [locations] = useCollectionData(
  //   getCollection('Locations').orderBy('name')
  // )
  // const [direct_donations] = useCollectionData(getCollection('DirectDonations'))

  const [retail_rescues_raw] = useCollectionData(
    getCollection('retail_rescues').orderBy('timestamps.scheduled_start')
  )
  const [retail_rescues, setRetailRescues] = useState()

  const [wholesale_rescues] = useCollectionData(
    getCollection('wholesale_rescues').orderBy('timestamps.updated')
  )
  const [pickups] = useCollectionData(
    getCollection('pickups').orderBy('timestamps.updated')
  )
  const [deliveries] = useCollectionData(
    getCollection('deliveries').orderBy('timestamps.updated')
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
      for (const rescue of retail_rescues_raw) {
        const r = { ...rescue, stops: [] }
        const rescue_pickups = pickups.filter(p => p.rescue_id === r.id)
        const rescue_deliveries = deliveries.filter(d => d.rescue_id === r.id)
        for (const s of r.stop_ids) {
          const stop =
            rescue_pickups.find(p => p.id === s) ||
            rescue_deliveries.find(d => d.id === s) ||
            {}
          stop.organization =
            organizations.find(o => o.id === stop.organization_id) || {}
          stop.location = locations.find(l => l.id === stop.location_id) || {}
          stop.type = stop.delivery_ids ? 'pickup' : 'delivery'
          r.stops.push(stop)
        }
        delete r.stop_ids
        r.driver = users.find(u => u.id === r.handler_id) || {}
        if (r.driver.icon && !isValidURL(r.driver.icon)) {
          r.driver.icon = await getImageFromStorage(r.driver.icon)
        }
        full_data.push(r)
      }
      setRetailRescues(full_data)
    }
    if (
      retail_rescues_raw &&
      retail_rescues_raw.length &&
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
  }, [retail_rescues_raw, organizations, locations, pickups, deliveries, users])

  return (
    <FirestoreContext.Provider
      value={{
        retail_rescues,
        wholesale_rescues,
        pickups,
        deliveries,
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
