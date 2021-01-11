import { useState, useEffect } from 'react'
import { useFirestoreContext } from '../components/Firestore/Firestore'

export default function useRouteData(filter) {
  const { routes } = useFirestoreContext()
  const [data, setData] = useState(
    !filter || Array.isArray(filter) || typeof filter === 'function' ? [] : null
  )

  useEffect(() => {
    if (routes) {
      const updated = Array.isArray(filter)
        ? routes.filter(i => filter.includes(i.id))
        : typeof filter === 'function'
        ? routes.filter(filter)
        : filter
        ? routes.find(i => i.id === filter)
        : routes
      if (updated && JSON.stringify(updated) !== JSON.stringify(data)) {
        setData(updated)
      }
    }
  }, [routes]) // eslint-disable-line react-hooks/exhaustive-deps

  return data
}
