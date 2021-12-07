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

export const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN
export const SENTRY_ENV = process.env.REACT_APP_SENTRY_ENV

export const IS_DEV_ENVIRONMENT = process.env.REACT_APP_FIREBASE_ENV === 'dev'

export const IS_PWA = window.matchMedia('(display-mode: standalone)').matches

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

/*

TODO: recurring routes? original_stop_id? is_philabundance_partner?

Route {

  id
  handler_id
  google_calendar_event_id
  is_wholesale
  is_direct_link

  status
  notes
  time_created
  time_updated
  time_range_start
  time_range_finish
  time_started
  time_finished
  stops[]

  dairy
  bakery
  produce
  meat_fish
  nonperishable
  prepared_frozen
  mixed
  other
  total_weight

}





Pickup {

  id
  driver_id
  route_id
  organization_id
  location_id

  status
  notes
  time_created
  time_updated
  time_started
  time_arrived
  time_finished
  route_stop_index

  dairy
  bakery
  produce
  meat_fish
  nonperishable
  prepared_frozen
  mixed
  other
  total_weight

}



Delivery {

  id
  driver_id
  route_id
  organization_id
  location_id

  status
  notes
  time_created
  time_updated
  time_started
  time_arrived
  time_finished
  route_stop_index

  dairy
  bakery
  produce
  meat_fish
  nonperishable
  prepared_frozen
  mixed
  other
  total_weight
  percent_of_total_in_vehicle

}

Organization {
  id
  name
  primary_location_id
  type (food_bank, community_fridge, home_delivery, retail, wholesale, se_warehouse)
}

Location {
  id
  nickname
  organization_id

  address1
  address2
  city
  state
  zip
  lat
  lng

  contact_name
  contact_email
  contact_phone
  instructions
  notes

  sun_open
  sun_close
  mon_open
  mon_close
  tue_open
  tue_close
  wed_open
  wed_close
  thu_open
  thu_close
  fri_open
  fri_close
  sat_open
  sat_close
}

User {
  id
  is_driver
  is_admin
  name
  icon
  email
  phone
  pronouns

  time_created
  time_updated
  time_granted_access
  time_last_login
  granted_access_by

  insurance_policy_number
  insurance_provider
  license_number
  license_state

  available_sun_am
  available_sun_pm
  available_mon_am
  available_mon_pm
  available_tue_am
  available_tue_pm
  available_wed_am
  available_wed_pm
  available_thu_am
  available_thu_pm
  available_fri_am
  available_fri_pm
  available_sat_am
  available_sat_pm
}

*/
