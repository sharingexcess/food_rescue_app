const admin = require('firebase-admin')
exports.app = admin.initializeApp()
exports.db = admin.firestore()

exports.fetchCollection = async name => {
  const results = []
  await admin
    .firestore()
    .collection(name)
    .get()
    .then(snapshot => snapshot.forEach(doc => results.push(doc.data())))
  return results
}

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

exports.DONOR_SUB_TYPES = ['retail', 'wholesale', 'holding', 'other']

exports.RECIPIENT_SUB_TYPES = [
  'food_bank',
  'agency',
  'popup',
  'community_fridge',
  'home_delivery',
  'holding',
  'other',
]

exports.EMISSIONS_COEFFICIENT = 3.66
