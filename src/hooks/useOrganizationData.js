import { useState, useEffect } from 'react'
import { useFirestoreContext } from '../components/Firestore/Firestore'

export default function useOrganizationData(filter) {
  const { organizations } = useFirestoreContext()
  const [data, setData] = useState(
    !filter || Array.isArray(filter) || typeof filter === 'function' ? [] : null
  )

  useEffect(() => {
    if (organizations) {
      const updated = Array.isArray(filter)
        ? organizations.filter(i => filter.includes(i.id))
        : typeof filter === 'function'
        ? organizations.filter(filter)
        : filter
        ? organizations.find(i => i.id === filter)
        : organizations
      if (updated && JSON.stringify(updated) !== JSON.stringify(data)) {
        setData(updated)
      }
    }
  }, [organizations, filter]) // eslint-disable-line react-hooks/exhaustive-deps

  return data
}
