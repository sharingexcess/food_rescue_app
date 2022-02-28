import { getCollection } from 'helpers'
import { useEffect } from 'react'

export function useFirestoreListener(collection, callback) {
  useEffect(() => {
    const unsubscribe = getCollection(collection).onSnapshot(() =>
      callback(performance.now())
    )
    return () => unsubscribe()
  }, [collection, callback])
}
