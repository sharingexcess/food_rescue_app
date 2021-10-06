import { FirestoreContext } from 'contexts'
import { useContext, useEffect, useState } from 'react'

export const useFirestore = (collection, filter) => {
  const data = useContext(FirestoreContext)
  const [filtered, setFiltered] = useState(
    !filter || Array.isArray(filter) || typeof filter === 'function' ? [] : null
  )

  useEffect(() => {
    if (data[collection]) {
      const updated = Array.isArray(filter)
        ? data[collection].filter(i => filter.includes(i.id))
        : typeof filter === 'function'
        ? data[collection].filter(filter)
        : filter
        ? data[collection].find(i => i.id === filter)
        : data[collection]
      if (updated && JSON.stringify(updated) !== JSON.stringify(data)) {
        setFiltered(updated)
      }
    }
  }, [data[collection], filter]) // eslint-disable-line react-hooks/exhaustive-deps

  return filtered
}
