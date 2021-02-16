import { useState, useEffect } from 'react'
import { useFirestoreContext } from '../components/Firestore/Firestore'

export default function useUserData(filter) {
  const { users } = useFirestoreContext()
  const [data, setData] = useState(
    !filter || Array.isArray(filter) || typeof filter === 'function' ? [] : null
  )

  useEffect(() => {
    if (users) {
      const updated = Array.isArray(filter)
        ? users.filter(i => filter.includes(i.id))
        : typeof filter === 'function'
        ? users.filter(filter)
        : filter
        ? users.find(i => i.id === filter)
        : users
      if (updated && JSON.stringify(updated) !== JSON.stringify(data)) {
        setData(updated)
      }
    }
  }, [users, filter]) // eslint-disable-line react-hooks/exhaustive-deps
  return data
}
