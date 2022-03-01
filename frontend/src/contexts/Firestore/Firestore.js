import { createContext } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { getCollection } from 'helpers'

const FirestoreContext = createContext()
FirestoreContext.displayName = 'Firestore'

function Firestore({ children }) {
  const [organizations] = useCollectionData(
    getCollection('organizations').orderBy('name')
  )
  const [locations] = useCollectionData(
    getCollection('locations').orderBy('id')
  )
  const [users] = useCollectionData(getCollection('users').orderBy('name'))

  return (
    <FirestoreContext.Provider
      value={{
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
