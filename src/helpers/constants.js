import moment from 'moment'

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
export const MOBILE_THRESHOLD = 600

export const FORMSPREE_FORM_ID = 'xlezdgjl'

export const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/dir/?api=1&destination='

export const FOOD_CATEGORIES = [
  'impact_data_dairy',
  'impact_data_bakery',
  'impact_data_produce',
  'impact_data_meat_fish',
  'impact_data_non_perishable',
  'impact_data_prepared_frozen',
  'impact_data_mixed',
  'impact_data_other',
]

// Current values are from 2019 REFED values, to be updated whenever new literature is available
// https://refed.org/downloads/ReFED-U.S.-Grocery-Retail-Value-to-Weight-Conversion-Factors.pdf
export const RETAIL_VALUES = {
  impact_data_dairy: 1.28,
  impact_data_bakery: 2.36,
  impact_data_produce: 1.57,
  impact_data_meat_fish: 4.4,
  impact_data_non_perishable: 3.19,
  impact_data_prepared_frozen: 5.89,
  impact_data_mixed: 3.1,
  impact_data_other: 2.31,
}

export const FAIR_MARKET_VALUES = {
  impact_data_dairy: 1.42,
  impact_data_bakery: 2.14,
  impact_data_produce: 1.13,
  impact_data_meat_fish: 2.77,
  impact_data_non_perishable: 2.13,
  impact_data_prepared_frozen: 2.17,
  impact_data_mixed: 1.62,
  impact_data_other: 1.62,
}

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
  OTHER: 'other',
}

export const ORG_TYPE_ICONS = {
  retail: 'department-store',
  wholesale: 'package',
  holding: 'palms-up-together',
  other: 'red-question-mark',
  food_bank: 'red-apple',
  agency: 'briefcase',
  popup: 'person-raising-hand',
  community_fridge: 'cityscape',
  home_delivery: 'house',
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
  OTHER: 'other',
}

export const CLOUD_FUNCTION_URLS = {
  addCalendarEvent:
    process.env.REACT_APP_CLOUD_FUNCTION_BASE_URL + 'calendar/add',
  deleteCalendarEvent:
    process.env.REACT_APP_CLOUD_FUNCTION_BASE_URL + 'calendar/delete',
  analytics: process.env.REACT_APP_CLOUD_FUNCTION_BASE_URL + 'analytics',
}

export const FIRST_RESCUE_IN_DB = process.env.REACT_APP_FIRST_RESCUE_IN_DB
export const DEFAULT_DB_LIMIT = moment().subtract(7, 'days').toDate()

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const COLORS = [
  '#205a08',
  '#307e0e',
  '#4ea528',
  '#6bcf3f',
  '#8af55c',
  '#b8ff9a',
]

export const EMISSIONS_COEFFICIENT = 3.66

export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
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
