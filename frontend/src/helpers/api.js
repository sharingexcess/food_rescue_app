import { API_URL } from './constants'
import { auth } from './firebase'

export const SE_API = {
  post: async function (endpoint, payload) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { accessToken: auth.currentUser.accessToken },
    }).catch(e => console.error('Error in post api:', e))
    return response
  },
  get: async function (endpoint, params) {
    const response = await fetch(
      `${API_URL}${endpoint}?${Object.keys(params)
        .map(i => `${i}=${full_params[i]}`)
        .join('&')}`,
      {
        headers: { accessToken: auth.currentUser.accessToken },
      }
    ).catch(e => console.error('Error in get api:', e))
    return response
  },
}
