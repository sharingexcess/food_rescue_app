import { useState, useEffect } from 'react'
import { useFirestoreContext } from '../components/Firestore/Firestore'

export function usePickupData(filter) {
  const { pickups } = useFirestoreContext()
  const [data, setData] = useState(
    !filter || Array.isArray(filter) || typeof filter === 'function' ? [] : null
  )

  useEffect(() => {
    if (pickups) {
      const updated = Array.isArray(filter)
        ? pickups.filter(i => filter.includes(i.id))
        : typeof filter === 'function'
        ? pickups.filter(filter)
        : filter
        ? pickups.find(i => i.id === filter)
        : pickups
      if (updated && JSON.stringify(updated) !== JSON.stringify(data)) {
        setData(updated)
      }
    }
  }, [pickups, filter]) // eslint-disable-line react-hooks/exhaustive-deps

  return data
}
