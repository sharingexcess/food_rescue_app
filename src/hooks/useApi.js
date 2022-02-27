import { CLOUD_FUNCTION_URLS } from 'helpers'
import { useEffect, useState } from 'react'

export function useApi(endpoint) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: false,
  })

  useEffect(() => {
    setState(state => ({ ...state, loading: true }))
    const url = CLOUD_FUNCTION_URLS.api + encodeURI(endpoint)
    console.log('[useApi] Fetching URL:', url)
    fetch(url)
      .then(res => res.json())
      .then(payload => {
        console.log('[useApi] Received Payload for request:', endpoint, payload)
        setState(state => ({ ...state, data: payload, loading: false }))
      })
      .catch(e => {
        console.error('[useApi] Caught Error:', e)
        setState(state => ({ ...state, error: true }))
      })
  }, [endpoint])

  return [state.data, state.loading, state.error]
}
