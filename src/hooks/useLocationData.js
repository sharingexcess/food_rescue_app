import { useState, useEffect } from 'react'
import { useFirestoreContext } from 'contexts'

export function useLocationData(filter) {
  const { locations } = useFirestoreContext()
  const [data, setData] = useState(
    !filter || Array.isArray(filter) || typeof filter === 'function' ? [] : null
  )

  useEffect(() => {
    if (locations) {
      const updated = Array.isArray(filter)
        ? locations.filter(i => filter.includes(i.id))
        : typeof filter === 'function'
        ? locations.filter(filter)
        : filter
        ? locations.find(i => i.id === filter)
        : locations
      if (updated && JSON.stringify(updated) !== JSON.stringify(data)) {
        setData(updated)
      }
    }
  }, [locations, filter]) // eslint-disable-line react-hooks/exhaustive-deps

  return data
}
