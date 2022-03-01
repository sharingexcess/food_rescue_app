import { CLOUD_FUNCTION_URLS } from 'helpers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFirestoreListener } from './useFirestoreListener'

export function useApi(endpoint) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: false,
  })

  const fetchApi = useCallback(() => {
    if (endpoint && !state.loading) {
      setState(state => ({ ...state, loading: true }))
      const url = CLOUD_FUNCTION_URLS.api + encodeURI(endpoint)
      console.log('[useApi] Fetching URL:', url)
      fetch(url)
        .then(res => res.json())
        .then(payload => {
          // console.log('[useApi] Response for request:', endpoint, payload)
          setState(state => ({ ...state, data: payload, loading: false }))
        })
        .catch(e => {
          console.error('[useApi] Caught Error:', e)
          setState(state => ({ ...state, error: true }))
        })
    }
  }, [endpoint, state.loading])

  useEffect(fetchApi, [endpoint]) // eslint-disable-line

  const cache_identifier = useMemo(
    () => generateCacheIdentifier(endpoint),
    [endpoint]
  )

  useFirestoreListener(cache_identifier, fetchApi)

  return [state.data, state.loading, state.error, fetchApi]
}

function generateCacheIdentifier(endpoint) {
  if (!endpoint) return null

  // break endpoint into array, throwing out first element which will be an empty string
  const params = endpoint.split('/').slice(1)

  if (params[0] === 'rescue') {
    //
    return params
  }

  return null
}
