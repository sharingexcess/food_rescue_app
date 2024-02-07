const {
  db,
  EMISSIONS_COEFFICIENT,
  FAIR_MARKET_VALUES,
  fetchCollection,
  FOOD_CATEGORIES,
  RECIPIENT_SUB_TYPES,
  RETAIL_VALUES,
  rejectUnauthorizedRequest,
  authenticateRequest,
  COLLECTIONS,
  TRANSFER_TYPES,
  STATUSES,
} = require('../../../helpers')

async function analyticsEndpoint(request, response) {
  return new Promise(async resolve => {
    console.log('INVOKING ENDPOINT: analytics()\n', 'params:', request.query)

    const requestIsAuthenticated = await authenticateRequest(
      request.get('accessToken'),
      user => user.permission == 'admin'
    )

    const {
      date_range_start,
      date_range_end,
      analyticsType,
      transferType,
      fetchRescues,
      fetchOrganizations,
    } = request.query

    if (!requestIsAuthenticated) {
      if (analyticsType !== 'advanced') {
        rejectUnauthorizedRequest(response, resolve)
        return
      }
    }

    let { breakdown } = request.query
    breakdown = decodeURIComponent(breakdown)

    let payload

    if (analyticsType === 'advancedAnalytics') {
      payload = await advancedAnalytics(
        date_range_start,
        date_range_end,
        transferType,
        fetchRescues,
        fetchOrganizations
      )
    } else {
      payload = await analytics(
        date_range_start,
        date_range_end,
        breakdown,
        transferType
      )
    }

    if (payload != null) {
      response.status(200).send(JSON.stringify(payload))
      resolve()
      return
    } else {
      response.status(500).send('No breakdown provided!')
      resolve()
      return
    }
  })
}

// TODO: this is a duplicate, but going forward this would evolve into
// a more advanced analytics endpoint
async function fetchFilteredData(
  collection,
  dateRangeStart,
  dateRangeEnd,
  status
) {
  const snapshot = await db
    .collection(collection)
    .where('timestamp_completed', '>=', new Date(dateRangeStart).toISOString())
    .where('timestamp_completed', '<=', new Date(dateRangeEnd).toISOString())
    .get()

  return snapshot.docs
    .map(doc => doc.data())
    .filter(item => item.status === status)
}

const isEligibleOrg = orgSubtype => !['holding', 'compost'].includes(orgSubtype)

async function advancedAnalytics(
  date_range_start,
  date_range_end,
  transferType,
  fetchRescues = 'false',
  fetchOrganizations = 'false'
) {
  const [transfers, locations] = await Promise.all([
    fetchFilteredData(
      COLLECTIONS.TRANSFERS,
      date_range_start,
      date_range_end,
      STATUSES.COMPLETED
    ),
    fetchCollection(COLLECTIONS.LOCATIONS),
  ])

  let total_transfers = []

  if (transferType === 'collection') {
    total_transfers = await transfers.filter(
      s => s.type === TRANSFER_TYPES.COLLECTION
    )
  } else if (transferType === 'distribution') {
    total_transfers = await transfers.filter(
      s => s.type === TRANSFER_TYPES.DISTRIBUTION
    )
  } else if (transferType === 'all') {
    total_transfers = transfers
  }

  let rescues = []

  if (fetchRescues === 'true') {
    const rescue_ids = [...new Set(total_transfers.map(d => d.rescue_id))]
    const rescueDataResults = await fetchRescueDataInBatches(rescue_ids)
    rescues = rescueDataResults.map(rescue => rescue.data())
  }

  let organizations = []

  if (fetchOrganizations === 'true') {
    organizations = await fetchCollection(COLLECTIONS.ORGANIZATIONS)
  }

  return {
    total_transfers,
    locations,
    rescues,
    organizations,
  }
}

async function analytics(
  date_range_start,
  date_range_end,
  breakdown,
  transferType
) {
  console.log(
    'Calculating metrics with:',
    date_range_start,
    date_range_end,
    breakdown
  )

  const startDateIso = new Date(date_range_start).toISOString()
  const endDateIso = new Date(date_range_end).toISOString()

  async function fetchData(collection, status) {
    const snapshot = await db
      .collection(collection)
      .where('timestamp_completed', '>=', startDateIso)
      .where('timestamp_completed', '<=', endDateIso)
      .get()
    return snapshot.docs
      .map(doc => doc.data())
      .filter(item => item.status === status)
  }

  // Parallelize Firestore queries
  const [transfers, organizations, handlers] = await Promise.all([
    fetchData(COLLECTIONS.TRANSFERS, STATUSES.COMPLETED),
    fetchCollection(COLLECTIONS.ORGANIZATIONS),
    fetchCollection(COLLECTIONS.PUBLIC_PROFILES),
  ])

  const filtered_transfers =
    transferType === 'Collections'
      ? await transfers.filter(s => s.type === TRANSFER_TYPES.COLLECTION)
      : await transfers.filter(s => s.type === TRANSFER_TYPES.DISTRIBUTION)

  const {
    total_weight,
    total_categorized_weight,
    retail_value,
    fair_market_value,
    emissions_reduced,
  } = calculateMetrics(filtered_transfers, organizations)

  console.log(
    'METRICS:',
    total_weight,
    total_categorized_weight,
    retail_value,
    fair_market_value,
    emissions_reduced
  )

  async function getBreakdownPayload(type) {
    switch (type) {
      case 'Food Category':
        return await breakdownByFoodCategory(filtered_transfers, organizations)
      case 'Rescue Type':
        return await breakdownByRescueType(filtered_transfers, organizations)
      case 'Location Type':
        return await breakdownByLocationType(filtered_transfers, organizations)
      case 'Location and Rescue Type':
        return await breakdownByLocationAndRescueType(
          filtered_transfers,
          organizations
        )
      case 'Recipient Type':
        return await breakdownByRecipientType(filtered_transfers, organizations)
      case 'Donor':
        return await breakdownByDonor(filtered_transfers, organizations)
      case 'Recipient':
        return await breakdownByRecipient(filtered_transfers, organizations)
      case 'Driver':
        return await breakdownByDriver(filtered_transfers, handlers)
      default:
        return null
    }
  }

  const view_data = await getBreakdownPayload(breakdown)
  const payload = {
    total_weight,
    total_categorized_weight,
    retail_value,
    fair_market_value,
    emissions_reduced,
    view_data,
  }

  console.log('returning payload:', payload)
  return payload
}

function calculateMetrics(transfers, organizations) {
  let total_weight = 0,
    total_categorized_weight = 0,
    retail_value = 0,
    fair_market_value = 0,
    emissions_reduced = 0

  const orgSubtypes = new Map(organizations.map(o => [o.id, o.subtype]))

  for (const transfer of transfers) {
    // Check if the organization is valid (not holding or compost)
    if (isEligibleOrg(orgSubtypes.get(transfer.organization_id))) {
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

  return {
    total_weight,
    total_categorized_weight,
    retail_value,
    fair_market_value,
    emissions_reduced,
  }
}

// This function is used to calculate the total weight of each food category
function breakdownByFoodCategory(transfers, organizations) {
  const categories = {
    ...FOOD_CATEGORIES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}), // eslint-disable-line
  }

  const orgSubtypes = new Map(organizations.map(o => [o.id, o.subtype]))

  for (const category of FOOD_CATEGORIES) {
    categories[category] = transfers.reduce(
      (acc, curr) =>
        isEligibleOrg(orgSubtypes.get(curr.organization_id))
          ? acc + (curr.categorized_weight[category] || 0)
          : acc,
      0
    )
  }

  return sortObjectByValues(categories)
}

function getRescueData(rescue_id) {
  return db.collection(COLLECTIONS.RESCUES).doc(rescue_id).get()
}

async function fetchRescueDataInBatches(rescueIds, batchSize = 30) {
  const batches = []
  for (let i = 0; i < rescueIds.length; i += batchSize) {
    const batch = rescueIds.slice(i, i + batchSize)
    batches.push(Promise.all(batch.map(rescue_id => getRescueData(rescue_id))))
  }
  return (await Promise.all(batches)).flat()
}

// This function is used to calculate the total weight of each rescue type
async function breakdownByRescueType(transfers, organizations) {
  const RESCUE_TYPES = ['retail', 'wholesale', 'direct_link']
  const categories = RESCUE_TYPES.reduce(
    (acc, curr) => ({ ...acc, [curr]: 0 }),
    {}
  )

  const orgSubtypes = new Map(organizations.map(o => [o.id, o.subtype]))

  const rescueIds = [...new Set(transfers.map(d => d.rescue_id))]

  const rescueDataResults = await fetchRescueDataInBatches(rescueIds)
  const rescueDataMap = new Map(
    rescueDataResults.map((rescue, index) => [rescueIds[index], rescue.data()])
  )

  const rescue_count = rescueDataResults.length

  transfers.forEach(distribution => {
    const rescue = rescueDataMap.get(distribution.rescue_id)
    if (!rescue) return

    const orgSubtype = orgSubtypes.get(distribution.organization_id)
    if (!isEligibleOrg(orgSubtype)) return

    const rescue_type = rescue.type
    if (categories[rescue_type] !== undefined) {
      categories[rescue_type] += distribution.total_weight || 0
    }
  })

  console.log('rescue_count:', rescue_count)

  return sortObjectByValues(categories)
}

// This function is used to calculate the total weight of each location type
async function breakdownByLocationType(transfers, organizations) {
  const locationCategories = {
    hunts_point: 0,
    pwpm: 0,
    other: 0,
  }

  const orgTags = new Map(organizations.map(o => [o.id, o.tags]))
  const orgSubtypes = new Map(organizations.map(o => [o.id, o.subtype]))

  for (const transfer of transfers) {
    const org = organizations.find(o => o.id === transfer.organization_id)
    if (org && isEligibleOrg(orgSubtypes.get(org.id))) {
      const tags = orgTags.get(org.id) || []
      const weightToAdd = transfer.total_weight || 0

      if (tags.includes('Hunts Point')) {
        locationCategories['hunts_point'] += weightToAdd
      } else if (tags.includes('PWPM')) {
        locationCategories['pwpm'] += weightToAdd
      } else {
        locationCategories['other'] += weightToAdd
      }
    }
  }

  return sortObjectByValues(locationCategories)
}

// async function breakdownByAllLocationType(transfers, organizations) {
//   let locationCategories = {}

//   const orgTags = new Map(organizations.map(o => [o.id, o.tags]))
//   const orgSubtypes = new Map(organizations.map(o => [o.id, o.subtype]))

//   for (const transfer of transfers) {
//     const org = organizations.find(o => o.id === transfer.organization_id)
//     if (org && isEligibleOrg(orgSubtypes.get(org.id))) {
//       const tags = orgTags.get(org.id) || []
//       const weightToAdd = transfer.total_weight || 0

//       for (const tag of tags) {
//         if (tag in locationCategories) {
//           locationCategories[tag] += weightToAdd
//         } else {
//           locationCategories[tag] = weightToAdd
//         }
//       }
//     }
//   }

//   return sortObjectByValues(locationCategories)
// }

// This function is used to calculate the total weight of each location type
async function breakdownByLocationAndRescueType(distributions, organizations) {
  const categorizedWeights = {
    wholesale_pwpm: 0,
    wholesale_hunts_point: 0,
    direct_link_pwpm: 0,
    direct_link_hunts_point: 0,
    retail_pwpm: 0,
    retail_hunts_point: 0,
  }

  const orgSubtypes = new Map(organizations.map(o => [o.id, o.subtype]))
  const distributionRescueIds = new Set(
    distributions.map(distribution => distribution.rescue_id)
  )

  const rescues = await fetchRescueDataInBatches([...distributionRescueIds])

  const rescueMap = new Map(rescues.map(rescue => [rescue.id, rescue.data()]))

  for (const distribution of distributions) {
    const org = organizations.find(o => o.id === distribution.organization_id)
    if (org && isEligibleOrg(orgSubtypes.get(org.id))) {
      const tags = org.tags || []
      const weightToAdd = distribution.total_weight || 0
      const rescue = rescueMap.get(distribution.rescue_id)

      // Check rescue type and increment corresponding category
      if (rescue && tags.length > 0) {
        const rescueType = rescue.type
        const locationKey = tags.includes('Hunts Point')
          ? 'hunts_point'
          : tags.includes('PWPM')
          ? 'pwpm'
          : ''

        if (locationKey) {
          const key = `${rescueType}_${locationKey}`
          if (key in categorizedWeights) {
            categorizedWeights[key] += weightToAdd
          }
        }
      }
    }
  }

  return categorizedWeights
}

// This function is used to calculate the total weight of each recipient type
async function breakdownByRecipientType(distributions, organizations) {
  const categories = {
    ...RECIPIENT_SUB_TYPES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}), // eslint-disable-line
  }

  const orgSubtypes = new Map(organizations.map(o => [o.id, o.subtype]))

  for (const distribution of distributions) {
    const org = organizations.find(o => o.id === distribution.organization_id)
    if (org && isEligibleOrg(orgSubtypes.get(org.id))) {
      const orgSubtype = org.subtype
      categories[orgSubtype] += distribution.total_weight || 0
    }
  }

  return sortObjectByValues(categories)
}

// This function is used to calculate the total weight of each donor
async function breakdownByDonor(collections, organizations) {
  // Create a map for quick organization lookup
  const orgMap = organizations.reduce((map, org) => {
    map[org.id] = org
    return map
  }, {})

  const donors = {}

  for (const collection of collections) {
    const org = orgMap[collection.organization_id]
    if (org && org.name) {
      donors[org.name] =
        (donors[org.name] || 0) + (collection.total_weight || 0)
    } else {
      console.error('Unable to find organization or name missing:', collection)
    }
  }

  return sortObjectByValues(donors)
}

// This function is used to calculate the total weight of each recipient
async function breakdownByRecipient(distributions, organizations) {
  // Map initialization for quick lookup
  const orgMap = {}
  for (const org of organizations) {
    orgMap[org.id] = org
  }

  const recipients = {}

  for (const distribution of distributions) {
    const org = orgMap[distribution.organization_id]
    if (org && isEligibleOrg(org.subtype)) {
      const orgName = org.name
      const totalWeight = distribution.total_weight || 0

      if (orgName) {
        recipients[orgName] = (recipients[orgName] || 0) + totalWeight
      } else {
        console.error('Organization name missing:', distribution)
      }
    } else {
      console.error('Organization not eligible or not found:', distribution)
    }
  }

  return sortObjectByValues(recipients)
}

// This function is used to calculate the total weight of each driver
async function breakdownByDriver(distributions, handlers) {
  const handlerMap = handlers.reduce((map, handler) => {
    map[handler.id] = handler
    return map
  }, {})

  const recipients = {}

  for (const d of distributions) {
    const handlerId = d.handler_id
    const handler = handlerMap[handlerId]

    if (handler && handler.name) {
      const totalWeight = d.total_weight || 0
      const handlerName = handler.name

      recipients[handlerName] = (recipients[handlerName] || 0) + totalWeight
    } else {
      console.error(
        'Unable to add delivery to driver totals:',
        JSON.stringify(d)
      )
    }
  }

  return sortObjectByValues(recipients) // Ensure this function is optimized
}

function sortObjectByValues(object) {
  return Object.entries(object)
    .sort(([, a], [, b]) => b - a)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {})
}

exports.analyticsEndpoint = analyticsEndpoint
exports.analytics = analytics
