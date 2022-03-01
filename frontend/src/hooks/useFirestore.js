import { FirestoreContext } from 'contexts'
import { useContext, useEffect, useState } from 'react'

export const useFirestore = (collection, filter) => {
  const data = useContext(FirestoreContext)
  const [filtered, setFiltered] = useState(
    !filter || Array.isArray(filter) || typeof filter === 'function' ? [] : null
  )

  useEffect(() => {
    if (data[collection]) {
      // handle if the filter is an array of ids
      const updated = Array.isArray(filter)
        ? data[collection].filter(i => filter.includes(i.id))
        : typeof filter === 'function' // handle if filter is a callback function
        ? data[collection].filter(filter)
        : filter // handle if filter is a singular id
        ? data[collection].find(i => i.id === filter)
        : data[collection] // if filter is "falsey", return unfiltered data
      if (updated && JSON.stringify(updated) !== JSON.stringify(data)) {
        setFiltered(updated)
      }
    }
  }, [data[collection], filter]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!collection) {
    return data
  } else return filtered
}
