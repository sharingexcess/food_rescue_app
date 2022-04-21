import { getFirestoreRef } from 'helpers'
import { useEffect, useMemo, useState } from 'react'

const LOGS = true

export function useFirestoreListener(endpoint, api_session_id, callback) {
  const [isInitialFetch, setIsInitialFetch] = useState(true)
  const identifier = useMemo(
    () => generateCacheIdentifier(endpoint),
    [endpoint]
  )

  useEffect(() => {
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
    // don't include 'isInitialFetch' in dependencies - it causes double fetching on init
  }, [endpoint, identifier, callback, api_session_id]) // eslint-disable-line
}

function generateCacheIdentifier(endpoint) {
  if (!endpoint) return null
  // break endpoint into array, throwing out first element which will be an empty string
  const params = endpoint.split('/').slice(1)
  return params
}

function logInitializingConnection(identifier, api_session_id) {
  LOGS &&
    console.log(
      `%c[Firestore:${api_session_id}] Intializing Connection:`,
      ';font-weight:bold;background:lightgreen;color:black;',
      '\nidentifier:',
      identifier.join(' => '),
      '\napi_session_id:',
      api_session_id
    )
}

function logHandlingUpdate(identifier, isInitialFetch, api_session_id) {
  LOGS &&
    console.log(
      `%c[Firestore:${api_session_id}] ${
        isInitialFetch ? 'Requesting Fetch:' : 'Detected Update:'
      }`,
      ';font-weight:bold;background:lightgreen;color:black;',
      '\nidentifier:',
      identifier.join(' => '),
      '\napi_session_id:',
      api_session_id
    )
}

function logClosingConnection(identifier, api_session_id) {
  LOGS &&
    console.log(
      `%c[Firestore:${api_session_id}] Closing Connection:`,
      ';font-weight:bold;background:lightgreen;color:black;',
      '\nidentifier:',
      identifier.join(' => '),
      '\napi_session_id:',
      api_session_id
    )
}
