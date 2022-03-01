export function isFormDataEqual(data1, data2) {
  if (!data1 || !data2) return false
  const keys_to_compare = [
    'impact_data_dairy',
    'impact_data_bakery',
    'impact_data_produce',
    'impact_data_meat_fish',
    'impact_data_non_perishable',
    'impact_data_prepared_frozen',
    'impact_data_mixed',
    'impact_data_other',
    'impact_data_total_weight',
    'notes',
  ]
  for (const key of keys_to_compare) {
    if (data1[key] !== data2[key]) {
      return false
    }
  }
  return true
}
