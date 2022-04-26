import { createContext, useEffect, useState } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { getCollection } from 'helpers'
import { useAuth } from 'hooks'

const FirestoreContext = createContext()
FirestoreContext.displayName = 'Firestore'

function Firestore({ children }) {
  const { user } = useAuth()
  const [organizations] = useCollectionData(
    getCollection('organizations').orderBy('name')
  )
  const [locations] = useCollectionData(
    getCollection('locations').orderBy('id')
  )
  const [users, setUsers] = useState()

  useEffect(() => {
    if (user && user.is_admin) {
      getCollection('users').onSnapshot(querySnapshot => {
        const updatedUsers = []
        querySnapshot.forEach(doc => {
          updatedUsers.push(doc.data())
        })
        setUsers(updatedUsers)
      })
    } else if (user) {
      getCollection('users')
        .doc(user.uid)
        .onSnapshot(doc => setUsers([doc.data()]))
    }
  }, [user])

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
