exports.FOOD_CATEGORIES = [
  'impact_data_dairy',
  'impact_data_bakery',
  'impact_data_produce',
  'impact_data_meat_fish',
  'impact_data_non_perishable',
  'impact_data_prepared_frozen',
  'impact_data_mixed',
  'impact_data_other',
]

// this is an update to the original FOOD_CATEGORIES above
// to phase out the "impact_data_" prefix
exports.WEIGHT_CATEGORIES = [
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
  impact_data_dairy: 1.28,
  impact_data_bakery: 2.36,
  impact_data_produce: 1.57,
  impact_data_meat_fish: 4.4,
  impact_data_non_perishable: 3.19,
  impact_data_prepared_frozen: 5.89,
  impact_data_mixed: 3.1,
  impact_data_other: 2.31,
}

exports.FAIR_MARKET_VALUES = {
  impact_data_dairy: 1.42,
  impact_data_bakery: 2.14,
  impact_data_produce: 1.13,
  impact_data_meat_fish: 2.77,
  impact_data_non_perishable: 2.13,
  impact_data_prepared_frozen: 2.17,
  impact_data_mixed: 1.62,
  impact_data_other: 1.62,
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

exports.DONOR_SUB_TYPES = ['retail', 'wholesale', 'holding', 'other']

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
