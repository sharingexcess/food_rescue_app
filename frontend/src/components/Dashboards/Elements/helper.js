const EMISSIONS_COEFFICIENT = 3.66
const FAIR_MARKET_VALUES = {
  dairy: 1.42,
  bakery: 2.14,
  produce: 1.13,
  meat_fish: 2.77,
  non_perishable: 2.13,
  prepared_frozen: 2.17,
  mixed: 1.62,
  other: 1.62,
}

const FOOD_CATEGORIES = [
  'dairy',
  'bakery',
  'produce',
  'meat_fish',
  'non_perishable',
  'prepared_frozen',
  'mixed',
  'other',
]

const RETAIL_VALUES = {
  dairy: 1.28,
  bakery: 2.36,
  produce: 1.57,
  meat_fish: 4.4,
  non_perishable: 3.19,
  prepared_frozen: 5.89,
  mixed: 3.1,
  other: 2.31,
}

const isEligibleOrg = orgSubtype => !['holding', 'compost'].includes(orgSubtype)

export function calculateDashboardMetrics(transfers, organizations, orgId) {
  let total_weight = 0,
    total_categorized_weight = 0,
    retail_value = 0,
    fair_market_value = 0,
    emissions_reduced = 0

  const orgSubtypes = new Map(organizations.map(o => [o.id, o.subtype]))

  for (const transfer of transfers) {
    if (
      isEligibleOrg(orgSubtypes.get(transfer.organization_id)) &&
      transfer.organization_id === orgId
    ) {
      const transferWeight = transfer.total_weight || 0
      total_weight += transferWeight

      for (const category of FOOD_CATEGORIES) {
        const categoryWeight = transfer.categorized_weight[category] || 0
        total_categorized_weight += categoryWeight
        emissions_reduced += categoryWeight * EMISSIONS_COEFFICIENT
        retail_value += categoryWeight * RETAIL_VALUES[category]
        fair_market_value += categoryWeight * FAIR_MARKET_VALUES[category]
      }
    }
  }

  const meals_provided = parseInt(total_weight * 0.8)

  const aggregatedData = {}
  transfers.forEach(transfer => {
    if (
      isEligibleOrg(orgSubtypes.get(transfer.organization_id)) &&
      transfer.organization_id === orgId
    ) {
      Object.entries(transfer.categorized_weight).forEach(
        ([category, weight]) => {
          if (!aggregatedData[category]) {
            aggregatedData[category] = 0
          }
          aggregatedData[category] += weight
        }
      )
    }
  })

  const statsChartData = Object.entries(aggregatedData).map(
    ([name, value]) => ({
      name,
      value,
    })
  )

  return {
    total_weight,
    total_categorized_weight,
    retail_value,
    fair_market_value,
    emissions_reduced,
    meals_provided,
    statsChartData,
  }
}

export function formatLargeNumber(x) {
  if (!x) return 0
  const parts = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (parts[1] && parts[1].length > 2) {
    parts[1] = parts[1].substring(0, 2)
  }
  return parts.join('.')
}
