import { DB_COLLECTIONS, getFirestoreRef } from 'helpers'
import { useEffect, useMemo, useState } from 'react'

export function useFirestoreListener(endpoint, api_session_id, callback) {
  const [isInitialFetch, setIsInitialFetch] = useState(true)
  const identifier = useMemo(
    () => generateCacheIdentifier(endpoint),
    [endpoint]
  )

  useEffect(() => {
    try {
      if (identifier && identifier.length) {
        logInitializingConnection(identifier, api_session_id)
        const ref = getFirestoreRef(identifier)
        const unsubscribe = ref.onSnapshot(() => {
          logHandlingUpdate(identifier, isInitialFetch, api_session_id)
          if (isInitialFetch) {
            setIsInitialFetch(false)
          }
          callback()
        })

        return () => {
          if (identifier && identifier.length && unsubscribe) {
            logClosingConnection(identifier, api_session_id)
            unsubscribe()
          }
        }
      }
    } catch (e) {
      console.error(`Error in useFirstoreListener:${api_session_id} - `, e)
    }
    // don't include 'isInitialFetch' in dependencies - it causes double fetching on init
  }, [endpoint, identifier, callback, api_session_id]) // eslint-disable-line
}

function generateCacheIdentifier(endpoint) {
  if (!endpoint) return null
  // break endpoint into array, throwing out first element which will be an empty string
  const params = endpoint.split('/').slice(1)
  // ignore any requests that don't map to a db collection
  if (!Object.values(DB_COLLECTIONS).includes(params[0])) return
  return params
}

function logInitializingConnection(identifier, api_session_id) {
  // only create logs if the global window variable is set to 'true'
  window.se_api_logs &&
    console.log(
      `%c[Firestore:${api_session_id}] Intializing Connection:`,
      ';font-weight:bold;background:lightgreen;color:black;',
      '\nidentifier:',
      identifier.join(' => ')
    )
}

function logHandlingUpdate(identifier, isInitialFetch, api_session_id) {
  // only create logs if the global window variable is set to 'true'
  window.se_api_logs &&
    console.log(
      `%c[Firestore:${api_session_id}] ${
        isInitialFetch ? 'Requesting Fetch:' : 'Detected Update:'
      }`,
      ';font-weight:bold;background:lightgreen;color:black;',
      '\nidentifier:',
      identifier.join(' => ')
    )
}

function logClosingConnection(identifier, api_session_id) {
  // only create logs if the global window variable is set to 'true'
  window.se_api_logs &&
    console.log(
      `%c[Firestore:${api_session_id}] Closing Connection:`,
      ';font-weight:bold;background:lightgreen;color:black;',
      '\nidentifier:',
      identifier.join(' => ')
    )
}
