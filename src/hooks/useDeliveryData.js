import { useState, useEffect } from 'react'
import { useFirestoreContext } from '../components/Firestore/Firestore'

export default function useDeliveryData(filter) {
  const { deliveries } = useFirestoreContext()
  const [data, setData] = useState(
    !filter || Array.isArray(filter) || typeof filter === 'function' ? [] : null
  )

  useEffect(() => {
    if (deliveries) {
      const updated = Array.isArray(filter)
        ? deliveries.filter(i => filter.includes(i.id))
        : typeof filter === 'function'
        ? deliveries.filter(filter)
        : filter
        ? deliveries.find(i => i.id === filter)
        : deliveries
      if (updated && JSON.stringify(updated) !== JSON.stringify(data)) {
        setData(updated)
      }
    }
  }, [deliveries]) // eslint-disable-line react-hooks/exhaustive-deps

  return data
}
