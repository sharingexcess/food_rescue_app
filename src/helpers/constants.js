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

export const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN_KEY

// 600 pixels is our baseline threshold for handling a mobile screen vs. desktop
export const MOBILE_THRESHOLD = 600

export const PICKUP_STATUSES = {
  0: 'cancelled',
  1: 'scheduled',
  2: 'UNDEFINED_STATUS',
  3: 'in_progress',
  4: 'UNDEFINED_STATUS',
  5: 'UNDEFINED_STATUS',
  6: 'arrived',
  7: 'UNDEFINED_STATUS',
  8: 'UNDEFINED_STATUS',
  9: 'completed',
}

export const DELIVERY_STATUSES = {
  0: 'cancelled',
  1: 'scheduled',
  2: 'UNDEFINED_STATUS',
  3: 'in_progress',
  4: 'UNDEFINED_STATUS',
  5: 'UNDEFINED_STATUS',
  6: 'arrived',
  7: 'UNDEFINED_STATUS',
  8: 'UNDEFINED_STATUS',
  9: 'completed',
}

export const STOP_STATUSES = {
  0: 'cancelled',
  1: 'scheduled',
  2: 'UNDEFINED_STATUS',
  3: 'in_progress',
  4: 'UNDEFINED_STATUS',
  5: 'UNDEFINED_STATUS',
  6: 'arrived',
  7: 'UNDEFINED_STATUS',
  8: 'UNDEFINED_STATUS',
  9: 'completed',
}

export const ROUTE_STATUSES = {
  0: 'cancelled',
  1: 'scheduled',
  2: 'UNDEFINED_STATUS',
  3: 'in_progress',
  4: 'UNDEFINED_STATUS',
  5: 'UNDEFINED_STATUS',
  6: 'UNDEFINED_STATUS',
  7: 'UNDEFINED_STATUS',
  8: 'UNDEFINED_STATUS',
  9: 'completed',
}

export const CLOUD_FUNCTION_URLS = {
  addCalendarEvent:
    process.env.REACT_APP_CLOUD_FUNCTION_BASE_URL + 'addCalendarEvent',
  deleteCalendarEvent:
    process.env.REACT_APP_CLOUD_FUNCTION_BASE_URL + 'deleteCalendarEvent',
}
