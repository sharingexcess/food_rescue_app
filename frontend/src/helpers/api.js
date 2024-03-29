import { API_URL } from './constants'
import { isJSON } from 'validator'

export const SE_API = {
  post: async function (endpoint, payload, accessToken) {
    const request_start_timestamp = performance.now()
    console.log(
      `%c[SE_API.post()] Sending Request:`,
      ';font-weight:bold;background:yellow;color:black;',
      '\nendpoint:',
      endpoint,
      '\npayload:',
      payload,
      '\nhas valid accessToken:',
      !!accessToken
    )
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { accessToken },
    }).catch(handleError)
    if (!response.ok) handleError()
    const response_payload = await response.text().then(function (text) {
      return isJSON(text) ? JSON.parse(text) : text
    })
    console.log(
      `%c[SE_API.post()] Received Response:`,
      ';font-weight:bold;background:yellow;color:black;',
      '\nendpoint:',
      endpoint,
      '\nresponse:',
      response,
      'payload:',
      response_payload,
      '\nduration:',
      `${((performance.now() - request_start_timestamp) / 1000).toFixed(
        2
      )}seconds`
    )
    return response_payload
  },
}

function handleError() {
  if (
    window.confirm(
      "Uhoh... looks like there's an issue with out server. Press OK to go to the help page, or cancel to ignore."
    )
  ) {
    window.location.href = '/help'
  }
}
