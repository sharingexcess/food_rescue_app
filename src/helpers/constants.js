// all exports should be of type 'const' with an all caps var name separated by underscores

export const FIREBASE_CONFIG = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
}

// 600 pixels is our baseline threshold for handling a mobile screen vs. desktop
export const MOBILE_THRESHOLD = 600

// these values map a rescue's 'status' property to a literal meaning.
// 0, 3, 6, and 9 are currently used, with the other number remaining open for future use cases
export const RESCUE_STATUSES = {
  0: 'scheduled',
  1: 'UNDEFINED_STATUS',
  2: 'UNDEFINED_STATUS',
  3: 'assigned',
  4: 'UNDEFINED_STATUS',
  5: 'UNDEFINED_STATUS',
  6: 'reported',
  7: 'UNDEFINED_STATUS',
  8: 'UNDEFINED_STATUS',
  9: 'completed',
}

const test_url =
  'http://localhost:5001/sharing-excess-7e887/us-central1/backend/'

export const CLOUD_FUNCTION_URLS = {
  isUserAdmin: process.env.REACT_APP_CLOUD_FUNCTION_BASE_URL + 'isUserAdmin',
  setUserAdmin: process.env.REACT_APP_CLOUD_FUNCTION_BASE_URL + 'setUserAdmin',
  isUserBasicAccess:
    process.env.REACT_APP_CLOUD_FUNCTION_BASE_URL + 'isUserBasicAccess',
  setUserBasicAccess:
    process.env.REACT_APP_CLOUD_FUNCTION_BASE_URL + 'setUserBasicAccess',
  addCalendarEvent: test_url + 'addCalendarEvent',
  deleteCalendarEvent: test_url + 'deleteCalendarEvent',
}
