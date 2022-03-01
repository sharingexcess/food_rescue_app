import { CLOUD_FUNCTION_URLS } from 'helpers'
import { useCallback, useEffect, useState } from 'react'
import { useFirestore } from './useFirestore'

export function useApi(endpoint) {
  const { updatedAt } = useFirestore()
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: false,
  })

  const fetchApi = useCallback(() => {
    if (endpoint && !state.loading) {
      console.log('[useApi] Received Request:', endpoint)
      setState(state => ({ ...state, loading: true }))
      const url = CLOUD_FUNCTION_URLS.api + encodeURI(endpoint)
      console.log('[useApi] Fetching URL:', url)
      fetch(url)
        .then(res => res.json())
        .then(payload => {
          console.log('[useApi] Response for request:', endpoint, payload)
          setState(state => ({ ...state, data: payload, loading: false }))
        })
        .catch(e => {
          console.error('[useApi] Caught Error:', e)
          setState(state => ({ ...state, error: true }))
        })
    }
  }, [endpoint, state.loading])

  useEffect(() => fetchApi(endpoint), [endpoint, updatedAt]) // eslint-disable-line

  return [state.data, state.loading, state.error, fetchApi]
}
