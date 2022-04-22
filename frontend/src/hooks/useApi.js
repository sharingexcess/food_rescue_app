import { useEffect, useCallback, useState } from 'react'
import { CLOUD_FUNCTION_URLS, DB_COLLECTIONS, generateId } from 'helpers'
import { useFirestoreListener } from './useFirestoreListener'

export function useApi(endpoint, params = null) {
  const [state, setState] = useState({
    data: null,
    // last identifies the id of the last document returned
    // from a query, to enable pagination
    last: null,
    loading: false,
    error: false,
    // keep track of total docs loaded, to adjust "refresh"
    // limit if more paginated data has been loaded
    docs_loaded: 0,
    // keep track of last used params to make sure
    //  to not clear data if we are requesting a
    //  next page of data instead of a brand new request
    cached_params: null,
    // create a unique ID for this API session to identify in logs
    api_session_id: generateId().substring(0, 4).toUpperCase(),
  })

  // fetchApi is the function to actually make a request to the API,
  // and update state accordingly. It also handles pagination/limits
  // based on the the 'options' arg, ie: options: { load_more: true }
  // will call for new data, and merge it with exisiting data
  const fetchApi = useCallback(
    (options = {}) => {
      if (endpoint && !state.loading) {
        if (options.is_refresh && params && params.limit) {
          // adjust the limit to include all additional paginated data on refresh.
          // see notes above on docs_loaded for context
          params.limit = state.docs_loaded
        }
        const request = generateApiRequest(endpoint, params, state, options)
        logSendingRequest(endpoint, params, request, state.api_session_id)
        setState(state => ({
          ...state,
          loading: true,
          cached_params: JSON.stringify(params),
          data:
            JSON.stringify(params) === state.cached_params ? state.data : null,
        }))
        fetch(CLOUD_FUNCTION_URLS.api + request)
          .then(res => res.json())
          .then(payload => {
            logReceivedResponse(request, payload, state.api_session_id)
            setState(state => ({
              ...state,
              data:
                options.load_more && state.data
                  ? removeDuplicates([
                      ...state.data,
                      ...formatAllTimestamps(payload),
                    ])
                  : formatAllTimestamps(payload),
              docs_loaded:
                payload && payload.length
                  ? state.docs_loaded + payload.length
                  : 1,
              last:
                payload.length && params && payload.length === params.limit
                  ? payload.at(-1).id
                  : null,
              loading: false,
            }))
          })
          .catch(e => setState(state => ({ ...state, error: e })))
      }
    },
    [endpoint, params, state]
  )

  // useFirstoreListener will trigger the initial fetch,
  // and accept a callback as its 3rd arg to trigger
  // when an update is detected on the specified data
  useFirestoreListener(
    endpoint,
    state.api_session_id,
    useCallback(fetchApi, [endpoint, params]) // eslint-disable-line
  )

  useEffect(() => {
    // to handle cases where the request does not map to a Firestore DB collection,
    // make a fetch call directly, instead of allowing useFirestore Listener to trigger fetch
    if (
      endpoint &&
      !Object.values(DB_COLLECTIONS).includes(endpoint.split('/').slice(1)[0])
    ) {
      fetchApi()
    }
  }, [endpoint, params]) // eslint-disable-line

  // we pass to the consumer component all existing state,
  // plus a "refresh" function to recall fetchApi,
  // and a "loadMore" function to fetch new paginated data
  // based on the limit provided in 'params'
  return {
    ...state,
    refresh: () => fetchApi({ is_refresh: true }),
    loadMore: state.last ? () => fetchApi({ load_more: true }) : null,
  }
}

// convert the given enpoint and params into a fully constructed API pathname
// with query params and full formatting
function generateApiRequest(endpoint, params, state, options) {
  const full_params = {
    ...params,
    start_after: options.load_more ? state.last : null,
  }
  return encodeURI(
    endpoint +
      `?api_session_id=${state.api_session_id}` +
      // add an & only if additional params will be appended
      (Object.keys(full_params).filter(i => !!full_params[i]).length
        ? '&'
        : '') +
      Object.keys(full_params)
        .filter(i => !!full_params[i]) // filter out any falsey field values
        .map(i => `${i}=${full_params[i]}`)
        .join('&')
  )
}

function removeDuplicates(array) {
  return array.filter((v, i, a) => a.findIndex(v2 => v2.id === v.id) === i)
}

// convert all timestamps in the payload from strings to date objects recursively
function formatAllTimestamps(payload) {
  if (!payload) return null
  for (const key in payload) {
    if (key.includes(`timestamp_`)) {
      // convert all string timestamps into Date objects
      payload[key] = new Date(payload[key])
    } else if (typeof payload[key] === 'object') {
      // recurse through nested payloads
      payload[key] = formatAllTimestamps(payload[key])
    }
  }
  return payload
}

function logSendingRequest(endpoint, params, request, api_session_id) {
  // only create logs if the global window variable is set to 'true'
  window.se_api_logs &&
    console.log(
      `%c[API:${api_session_id}] Sending Request:`,
      ';font-weight:bold;background:lightblue;color:black;',
      '\nendpoint:',
      endpoint,
      '\nparams:',
      params,
      '\nurl:',
      request
    )
}

function logReceivedResponse(request, payload, api_session_id) {
  // only create logs if the global window variable is set to 'true'
  window.se_api_logs &&
    console.log(
      `%c[API:${api_session_id}] Received Response:`,
      ';font-weight:bold;background:lightblue;color:black;',
      '\nurl:',
      request,
      '\npayload:',
      payload
    )
}
