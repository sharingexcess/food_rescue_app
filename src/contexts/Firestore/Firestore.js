import { createContext } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { getCollection } from 'helpers'

const FirestoreContext = createContext()
FirestoreContext.displayName = 'Firestore'

function Firestore({ children }) {
  const [routes] = useCollectionData(getCollection('Routes'))
  const [pickups] = useCollectionData(getCollection('Pickups'))
  const [deliveries] = useCollectionData(getCollection('Deliveries'))
  const [users] = useCollectionData(getCollection('Users').orderBy('name'))
  const [organizations] = useCollectionData(
    getCollection('Organizations').orderBy('name')
  )
  const [locations] = useCollectionData(
    getCollection('Locations').orderBy('name')
  )
  const [direct_donations] = useCollectionData(getCollection('DirectDonations'))

  return (
    <FirestoreContext.Provider
      value={{
        routes,
        pickups,
        deliveries,
        users,
        organizations,
        locations,
        direct_donations,
      }}
    >
      {children}
    </FirestoreContext.Provider>
  )
}
export { Firestore, FirestoreContext }
