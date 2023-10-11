export function sortObjectByValues(object) {
  return Object.entries(object)
    .sort(([, a], [, b]) => b - a)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {})
}

export const calculateTotalWholesaleWeight = (
  wholesaleRescues,
  collectionTransfers
) => {
  let totalWeight = 0
  for (const wholesaleRescue of wholesaleRescues) {
    const collectionTransferId = wholesaleRescue.transfer_ids[0] // Assuming the first transfer ID is for collection
    console.log(collectionTransferId)
    const collectionTransfer = collectionTransfers.find(
      transfer => transfer.id === collectionTransferId
    )
    if (collectionTransfer) {
      totalWeight += collectionTransfer.total_weight
    }
  }
  return totalWeight
}

export const calculateTotalRetailWeight = (
  retailRescues,
  collectionTransfers
) => {
  let totalWeight = 0
  for (const retailRescue of retailRescues) {
    for (const transferId of retailRescue.transfer_ids) {
      const transfer = collectionTransfers.find(
        transfer => transfer.id === transferId
      )
      if (transfer) {
        totalWeight += transfer.total_weight
      }
    }
  }
  return totalWeight
}

const RECIPIENT_SUB_TYPES = [
  'food_bank',
  'agency',
  'popup',
  'community_fridge',
  'home_delivery',
  'holding',
  'compost',
  'other',
]

const DONOR_SUB_TYPES = ['retail', 'wholesale', 'holding', 'other']

export const breakdownByDonorType = (collections, organizations) => {
  const categories = {
    ...DONOR_SUB_TYPES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}), // eslint-disable-line
  }
  for (const p of collections) {
    try {
      const organization = organizations.find(o => o.id === p.organization_id)
      const { subtype } = organization
      categories[subtype] += p.total_weight || 0
    } catch (e) {
      console.error(
        'Unable to add pickup to donor type totals:',
        JSON.stringify(p)
      )
    }
  }
  return sortObjectByValues(categories)
}

export const getGeneralPieChart = categories => {
  // Compute the total weight for all donor types
  const total = Object.values(categories).reduce(
    (sum, weight) => sum + weight,
    0
  )

  // Transform each donor subtype into the desired pie chart format
  const data = Object.entries(categories).map(([type, weight]) => {
    return {
      Type: type,
      Percentage: total !== 0 ? ((weight / total) * 100).toFixed(2) : 0, // toFixed(2) rounds it to 2 decimal places
    }
  })

  return data
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

const EMISSIONS_COEFFICIENT = 3.66

export const calculateMetrics = (distributions, organizations) => {
  // IGNORE ANY DISTRIBUTIONS TO HOLDING/COMPOST ORGANIZATIONS - this means they have not reached a final end org
  distributions = distributions.filter(d => {
    const org = organizations.find(o => o.id === d.organization_id)
    return ![RECIPIENT_SUB_TYPES.HOLDING, RECIPIENT_SUB_TYPES.COMPOST].includes(
      org.subtype
    )
  })
  let total_categorized_weight = 0,
    retail_value = 0,
    fair_market_value = 0,
    emissions_reduced = 0
  const total_weight = distributions.reduce(
    (total, curr) => total + (curr.total_weight || 0),
    0
  )
  for (const category of FOOD_CATEGORIES) {
    const category_weight = distributions.reduce(
      (total, curr) => total + (curr.categorized_weight[category] || 0),
      0
    )
    total_categorized_weight += category_weight
    emissions_reduced += category_weight * EMISSIONS_COEFFICIENT
    retail_value += category_weight * RETAIL_VALUES[category]
    fair_market_value += category_weight * FAIR_MARKET_VALUES[category]
  }

  return {
    total_weight,
    total_categorized_weight,
    retail_value,
    fair_market_value,
    emissions_reduced,
  }
}

export const aggregateWeights = transfers => {
  const aggregatedWeights = {
    other: 0,
    bakery: 0,
    non_perishable: 0,
    prepared_frozen: 0,
    mixed: 0,
    dairy: 0,
    produce: 0,
    meat_fish: 0,
  }

  transfers.forEach(transfer => {
    for (const category in transfer.categorized_weight) {
      aggregatedWeights[category] += transfer.categorized_weight[category]
    }
  })

  return aggregatedWeights
}

export const getIncomingFoodChartData = aggregatedWeights => {
  // Calculate the total weight from all categories
  const totalWeight = Object.values(aggregatedWeights).reduce(
    (a, b) => a + b,
    0
  )

  return Object.keys(aggregatedWeights).map(category => {
    return {
      Type: category,
      Percentage: ((aggregatedWeights[category] / totalWeight) * 100).toFixed(
        2
      ),
    }
  })
}

export const toPieChartDataForWeight = aggregatedWeights => {
  // Calculate the total weight from all categories
  const totalWeight = Object.values(aggregatedWeights).reduce(
    (a, b) => a + b,
    0
  )

  return Object.keys(aggregatedWeights).map(category => {
    return {
      Type: category,
      Percentage: ((aggregatedWeights[category] / totalWeight) * 100).toFixed(
        2
      ),
    }
  })
}

export const aggregateWeightsByOrganization = transfers => {
  return transfers.reduce((acc, transfer) => {
    if (!acc[transfer.organization_id]) {
      acc[transfer.organization_id] = 0
    }
    acc[transfer.organization_id] += transfer.total_weight
    return acc
  }, {})
}

export const sortedOrganizationsByWeight = aggregatedWeights => {
  return Object.keys(aggregatedWeights)
    .sort((a, b) => aggregatedWeights[b] - aggregatedWeights[a])
    .map(orgId => ({ orgId, weight: aggregatedWeights[orgId] }))
}

export const getOrganizationsBySortedWeights = (sortedOrgs, organizations) => {
  return sortedOrgs.map(entry => {
    const org = organizations.find(org => org.id === entry.orgId)
    return { ...org, total_weight_donated: entry.weight }
  })
}

export const aggregateWeightsByLocation = (
  transfers,
  locations,
  organizations
) => {
  const locationWeights = {}

  // Aggregating weights by location_id
  transfers.forEach(transfer => {
    const totalWeight = Object.values(transfer.categorized_weight).reduce(
      (a, b) => a + b,
      0
    )
    if (!locationWeights[transfer.location_id]) {
      locationWeights[transfer.location_id] = totalWeight
    } else {
      locationWeights[transfer.location_id] += totalWeight
    }
  })

  // Fetch the corresponding locations based on the location_id from the aggregated weights
  const fetchedLocations = Object.keys(locationWeights).map(locationId => {
    const correspondingLocation = locations.find(loc => loc.id === locationId)
    const org = organizations.find(
      org => org.id === correspondingLocation.organization_id
    )

    return {
      ...correspondingLocation,
      total_weight_received: locationWeights[locationId],
      organization: org,
    }
  })

  return fetchedLocations
}

// Usage
