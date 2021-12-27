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

export const FORMSPREE_FORM_ID = 'xlezdgjl'

export const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/dir/?api=1&destination='

export const RESCUE_STATUSES = {
  0: 'cancelled',
  1: 'scheduled',
  2: 'UNDEFINED_STATUS',
  3: 'active',
  4: 'UNDEFINED_STATUS',
  5: 'UNDEFINED_STATUS',
  6: 'UNDEFINED_STATUS',
  7: 'UNDEFINED_STATUS',
  8: 'UNDEFINED_STATUS',
  9: 'completed',
}

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
    process.env.REACT_APP_CLOUD_FUNCTION_BASE_URL + 'addCalendarEvent',
  deleteCalendarEvent:
    process.env.REACT_APP_CLOUD_FUNCTION_BASE_URL + 'deleteCalendarEvent',
}

/*

TODO:
is_philabundance_partner => location
define either tool as wholesale or retail

SE Data Updates

Needs UI Work:
- [ ] Direct Link for all routes/retail rescue
- [ ] Pickup - time started
- [ ] Pickup - time arrived
- [ ] Pickup - validate all time stamps are populated on completion
- [ ] User timestamps
- [ ] Phone input
- [ ] Access level
- [ ] Onboarding checks
- [ ] Rerun-deliveries
- [ ] ADD IS_DELETED TO LOCATION
- [ ] User Icons
- [ ] Add Availability to Route Creation


Data Validation/Backfilling
- [ ] Time stamps for pickups
- [ ] Driver Availability



rescue {

  id
  type ( retail | wholesale )
  handler_id
  google_calendar_event_id
  stop_ids
  is_direct_link
  status
  notes

  timestamp_created
  timestamp_updated
  timestamp_logged_start
  timestamp_logged_finish
  timestamp_scheduled_start
  timestamp_scheduled_finish

}



pickup {

  id
  handler_id
  rescue_id
  donor_id
  location_id
  status
  notes
  is_direct_link

  timestamp_created
  timestamp_updated
  timestamp_started
  timestamp_finished

  impact_data_dairy
  impact_data_bakery
  impact_data_produce
  impact_data_meat_fish
  impact_data_non_perishable
  impact_data_prepared_frozen
  impact_data_mixed
  impact_data_other
  impact_data_total_weight

}



delivery {

  id
  handler_id
  rescue_id
  recipient_id
  location_id
  status
  notes
  is_direct_link

  timestamp_created
  timestamp_updated
  timestamp_started
  timestamp_finished

  impact_data_dairy
  impact_data_bakery
  impact_data_produce
  impact_data_meat_fish
  impact_data_non_perishable
  impact_data_prepared_frozen
  impact_data_mixed
  impact_data_other
  impact_data_total_weight
  impact_data_percent_of_total_dropped

}



donor {
  id
  name
  icon
  type (
    retail_donor, wholesale_donor, holding, other
  )

  timestamp_created
  timestamp_updated

}



recipient {
  id
  name
  icon
  type (
    food_bank, distribution_agency, community_fridge, home_delivery, popup, holding, other
  )

  timestamp_created
  timestamp_updated

}



location {
  id
  nickname
  parent_type
  parent_id


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

  notes

  timestamp_created
  timestamp_updated

}



user {
  id
  is_driver
  is_admin
  name
  icon
  email
  phone
  pronouns

  completed_app_tutorial
  completed_food_safety
  completed_liability_release

  timestamp_created
  timestamp_updated
  timestamp_last_active
  

  insurance_policy_number
  insurance_provider
  license_number
  license_state
  vehicle_make_model

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
