import { useEffect, useCallback, useState } from 'react'
import { API_URL, generateId } from 'helpers'
import { useAuth } from './useAuth'
import { useToast } from '@chakra-ui/react'

export function useApi(endpoint, params = null, showToast = true) {
  const { user } = useAuth()
  const toast = useToast()
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
    //Request Id will be generated at time of fetch to filter stale requests
    request_id: null,
  })

  // fetchApi is the function to actually make a request to the API,
  // and update state accordingly. It also handles pagination/limits
  // based on the the 'options' arg, ie: options: { load_more: true }
  // will call for new data, and merge it with exisiting data
  const fetchApi = useCallback(
    (options = {}) => {
      // if (endpoint && !state.loading) {  //Testing removing loading
      if (endpoint) {
        if (options.is_refresh && params && params.limit) {
          // adjust the limit to include all additional paginated data on refresh.
          // see notes above on docs_loaded for context
          params.limit = state.docs_loaded
        }
        const request = generateApiRequest(endpoint, params, state, options)
        const request_id = generateId().substring(0, 4).toUpperCase()
        logSendingRequest(endpoint, params, request, state.api_session_id)
        setState(state => ({
          ...state,
          loading: true,
          cached_params: JSON.stringify(params),
          data:
            JSON.stringify(params) === state.cached_params ? state.data : null,
          request_id: request_id,
        }))
        const request_start_timestamp = performance.now()
        fetch(API_URL + request, { headers: { accessToken: user.accessToken } })
          .then(async res => {
            if (!res.ok) {
              let message
              // attempt to get an error, message, but don't let this throw it's own error
              try {
                const msg = await res.text()
                message = msg
              } catch (e) {
                // do nothing
              }
              if (showToast) {
                toast({
                  title: 'Uhoh...',
                  description: `Looks like there was an error getting data for this page. Go to the "help" page if this problem persists.`,
                  status: 'error',
                  duration: 5000,
                  isClosable: true,
                  position: 'top',
                })
              }
              throw new Error(
                `${res.status} ${res.statusText}${
                  message ? ' - ' + message : ''
                }`
              )
            } else return res.json()
          })
          .then(
            payload => {
              // if (request_id === state.request_id) {  TODO: throw out request that are out of date
              logReceivedResponse(
                request,
                payload,
                state.api_session_id,
                request_start_timestamp
              )
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
                    ? payload[payload.length - 1].id
                    : null,
                loading: false,
              }))
            }
            // }
          )
          .catch(e => setState(state => ({ ...state, error: e.toString() })))
      }
    },
    [endpoint, params, state]
  )

  // make an initial fetch
  useEffect(fetchApi, [endpoint, params]) // eslint-disable-line

  // useFirstoreListener will accept a callback as its 3rd arg to trigger
  // when an update is detected on the specified data

  // useFirestoreListener(
  //   endpoint,
  //   state.api_session_id,
  //   useCallback(fetchApi, [endpoint, params]) // eslint-disable-line
  // )

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

// convert the given endpoint and params into a fully constructed API pathname
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
        .filter(i => full_params[i] != null) // filter out any falsey field values
        .map(i => `${i}=${full_params[i]}`)
        .join('&')
  )
}

function removeDuplicates(array) {
  return array.filter(
    (currValue, currIndex, array) =>
      array.findIndex(v2 => v2.id === currValue.id) === currIndex
  )
}

// convert all timestamps in the payload from strings to date objects recursively
function formatAllTimestamps(payload) {
  if (!payload) return null
  for (const key in payload) {
    if (key.includes(`timestamp_`)) {
      // convert all string timestamps into Date objects
      payload[key] = payload[key] ? new Date(payload[key]) : null
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

function logReceivedResponse(
  request,
  payload,
  api_session_id,
  request_start_timestamp
) {
  // only create logs if the global window variable is set to 'true'
  window.se_api_logs &&
    console.log(
      `%c[API:${api_session_id}] Received Response:`,
      ';font-weight:bold;background:lightblue;color:black;',
      '\nurl:',
      request,
      '\npayload:',
      payload,
      '\nduration:',
      `${((performance.now() - request_start_timestamp) / 1000).toFixed(
        2
      )}seconds`
    )
}
