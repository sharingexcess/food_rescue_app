import { API_URL } from './constants'

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
    }).catch(e => {
      throw new Error('Error in POST api:', e)
    })
    if (!response.ok) {
      throw new Error('Error in POST api:', response)
    }
    const response_payload = response.text().then(function (text) {
      return text ? JSON.parse(text) : {}
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
