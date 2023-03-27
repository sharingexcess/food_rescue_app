// all exports should be of type 'const' with an all caps var name separated by underscores

export const VERSION = process.env.REACT_APP_VERSION

export const FIREBASE_CONFIG = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
}

export const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN
export const SENTRY_ENV = process.env.REACT_APP_SENTRY_ENV

export const IS_DEV_ENVIRONMENT = process.env.REACT_APP_FIREBASE_ENV === 'dev'

export const IS_PWA = window.matchMedia('(display-mode: standalone)').matches

// 600 pixels is our baseline threshold for handling a mobile screen vs. desktop
export const MOBILE_THRESHOLD = 992

export const FORMSPREE_FORM_ID = 'xlezdgjl'

export const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/dir/?api=1&destination='

export const API_ENDPOINTS = { RESCUES: '/rescues' }

export const DB_COLLECTIONS = {
  RESCUES: 'rescues',
  STOPS: 'stops',
  ORGANIZATIONS: 'organizations',
  LOCATIONS: 'locations',
  USERS: 'users',
}

export const FOOD_CATEGORIES = [
  'dairy',
  'bakery',
  'produce',
  'meat_fish',
  'non_perishable',
  'prepared_frozen',
  'mixed',
  'other',
]

export const EMPTY_CATEGORIZED_WEIGHT = () => ({
  dairy: 0,
  bakery: 0,
  produce: 0,
  meat_fish: 0,
  non_perishable: 0,
  prepared_frozen: 0,
  mixed: 0,
  other: 0,
})

// Current values are from 2019 REFED values, to be updated whenever new literature is available
// https://refed.org/downloads/ReFED-U.S.-Grocery-Retail-Value-to-Weight-Conversion-Factors.pdf
export const RETAIL_VALUES = {
  dairy: 1.28,
  bakery: 2.36,
  produce: 1.57,
  meat_fish: 4.4,
  non_perishable: 3.19,
  prepared_frozen: 5.89,
  mixed: 3.1,
  other: 2.31,
}

export const FAIR_MARKET_VALUES = {
  dairy: 1.42,
  bakery: 2.14,
  produce: 1.13,
  meat_fish: 2.77,
  non_perishable: 2.13,
  prepared_frozen: 2.17,
  mixed: 1.62,
  other: 1.62,
}

export const EMISSIONS_COEFFICIENT = 3.66

export const ORG_TYPES = ['donor', 'recipient']

export const ORG_SUBTYPES = {
  RETAIL: 'retail',
  WHOLESALE: 'wholesale',
  FOOD_BANK: 'food_bank',
  AGENCY: 'agency',
  HOME_DELIVERY: 'home_delivery',
  COMMUNITY_FRIDGE: 'community_fridge',
  POPUP: 'popup',
  HOLDING: 'holding',
  COMPOST: 'compost',
  OTHER: 'other',
}

export const ORG_TYPE_ICONS = {
  retail: '🏬',
  wholesale: '📦',
  holding: '🤲',
  other: '❓',
  food_bank: '🍎',
  agency: '💼',
  popup: '🎪',
  community_fridge: '🏙',
  home_delivery: '🏠',
  compost: '🥦',
}

export const STATUSES = {
  CANCELLED: 'cancelled',
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  COMPLETED: 'completed',
}

export const DONOR_TYPES = {
  RETAIL: 'retail',
  WHOLESALE: 'wholesale',
  HOLDING: 'holding',
  OTHER: 'other',
}

export const RECIPIENT_TYPES = {
  FOOD_BANK: 'food_bank',
  AGENCY: 'agency',
  HOME_DELIVERY: 'home_delivery',
  COMMUNITY_FRIDGE: 'community_fridge',
  POPUP: 'popup',
  HOLDING: 'holding',
  COMPOST: 'compost',
  OTHER: 'other',
}

export const API_URL =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_URL_LOCAL
    : process.env.REACT_APP_API_URL_HOSTED

export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Monday - Friday',
]
export const TIMES = [
  '8:00',
  '8:30',
  '9:00',
  '9:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
]

export const TRANSFER_TYPES = {
  COLLECTION: 'collection',
  DISTRIBUTION: 'distribution',
}
