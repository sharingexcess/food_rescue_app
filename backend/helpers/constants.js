exports.FOOD_CATEGORIES = [
  'dairy',
  'bakery',
  'produce',
  'meat_fish',
  'non_perishable',
  'prepared_frozen',
  'mixed',
  'other',
]

exports.RETAIL_VALUES = {
  dairy: 1.28,
  bakery: 2.36,
  produce: 1.57,
  meat_fish: 4.4,
  non_perishable: 3.19,
  prepared_frozen: 5.89,
  mixed: 3.1,
  other: 2.31,
}

exports.FAIR_MARKET_VALUES = {
  dairy: 1.42,
  bakery: 2.14,
  produce: 1.13,
  meat_fish: 2.77,
  non_perishable: 2.13,
  prepared_frozen: 2.17,
  mixed: 1.62,
  other: 1.62,
}

exports.RESCUE_TYPES = {
  RETAIL: 'retail',
  WHOLESALE: 'wholesale',
  DIRECT_LINK: 'direct_link',
}

exports.TRANSFER_TYPES = {
  COLLECTION: 'collection',
  DISTRIBUTION: 'distribution',
}

exports.ORGANIZATION_TYPES = { DONOR: 'donor', RECIPIENT: 'recipient' }

exports.DONOR_SUB_TYPES = ['retail', 'wholesale', 'holding', 'other']

exports.DONOR_RESCUE_TYPES = ['retail', 'wholesale', 'direct_link']

exports.RESCUE_TYPES = ['retail', 'wholesale', 'direct_link']

exports.RECIPIENT_SUB_TYPES = [
  'food_bank',
  'agency',
  'popup',
  'community_fridge',
  'home_delivery',
  'holding',
  'compost',
  'other',
]

exports.EMISSIONS_COEFFICIENT = 3.66

exports.STATUSES = {
  CANCELLED: 'cancelled',
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  COMPLETED: 'completed',
}

exports.COLLECTIONS = {
  RESCUES: 'rescues',
  TRANSFERS: 'transfers',
  PUBLIC_PROFILES: 'public_profiles',
  PRIVATE_PROFILES: 'private_profiles',
  ORGANIZATIONS: 'organizations',
  LOCATIONS: 'locations',
}

exports.PERMISSION_LEVELS = {
  NONE: null,
  STANDARD: 'standard',
  ADMIN: 'admin',
}

exports.EMPTY_CATEGORIZED_WEIGHT = () => ({
  dairy: 0,
  bakery: 0,
  produce: 0,
  meat_fish: 0,
  non_perishable: 0,
  prepared_frozen: 0,
  mixed: 0,
  other: 0,
})
