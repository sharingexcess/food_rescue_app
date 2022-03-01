import { createContext, useState } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { getCollection } from 'helpers'
import { useFirestoreListener } from 'hooks'

const FirestoreContext = createContext()
FirestoreContext.displayName = 'Firestore'

function Firestore({ children }) {
  const [updatedAt, setUpdatedAt] = useState(performance.now())
  // initialized listeners so that useApi knows when it needs to refresh
  useFirestoreListener('rescues', setUpdatedAt)
  useFirestoreListener('stops', setUpdatedAt)
  useFirestoreListener('organizations', setUpdatedAt)
  useFirestoreListener('locations', setUpdatedAt)
  useFirestoreListener('users', setUpdatedAt)
  const organizations = [],
    users = [],
    locations = []
  // const [organizations] = useCollectionData(
  //   getCollection('organizations').orderBy('name')
  // )
  // const [locations] = useCollectionData(
  //   getCollection('locations').orderBy('id')
  // )
  // const [users] = useCollectionData(getCollection('users').orderBy('name'))

  return (
    <FirestoreContext.Provider
      value={{
        users,
        organizations,
        locations,
        updatedAt,
      }}
    >
      {children}
    </FirestoreContext.Provider>
  )
}
export { Firestore, FirestoreContext }
