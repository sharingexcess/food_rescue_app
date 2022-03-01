import { getFirestoreRef } from 'helpers'
import { useEffect } from 'react'

export function useFirestoreListener(identifier, callback) {
  useEffect(() => {
    if (identifier && identifier.length) {
      console.log('[useFirestoreListener] Adding Listener for id:', identifier)
      // const unsubscribe =
      getFirestoreRef(identifier).onSnapshot(() => {
        console.log(
          '[useFirestoreListener] Detected Update for id:',
          identifier
        )
        callback()
      })
      // return () => {
      //   if (identifier && identifier.length && unsubscribe) {
      //     console.log(
      //       '[useFirestoreListener] Removing Listener for id:',
      //       identifier
      //     )
      //     unsubscribe()
      //   }
      // }
    }
  }, [identifier, callback])
}
