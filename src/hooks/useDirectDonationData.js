import { useState, useEffect } from 'react'
import { useFirestoreContext } from '../components/Firestore/Firestore'

export function useDirectDonationData(filter) {
  const { direct_donations } = useFirestoreContext()
  const [data, setData] = useState(
    !filter || Array.isArray(filter) || typeof filter === 'function' ? [] : null
  )

  useEffect(() => {
    if (direct_donations) {
      const updated = Array.isArray(filter)
        ? direct_donations.filter(i => filter.includes(i.id))
        : typeof filter === 'function'
        ? direct_donations.filter(filter)
        : filter
        ? direct_donations.find(i => i.id === filter)
        : direct_donations
      if (updated && JSON.stringify(updated) !== JSON.stringify(data)) {
        setData(updated)
      }
    }
  }, [direct_donations, filter]) // eslint-disable-line react-hooks/exhaustive-deps

  return data
}
