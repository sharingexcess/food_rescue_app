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

    if (!requestIsAuthenticated) {
      rejectUnauthorizedRequest(response)
      return
    }
    const { date_range_start, date_range_end, analyticsType } = request.query
    let { breakdown } = request.query
    breakdown = decodeURIComponent(breakdown)

    let payload

    if (analyticsType === 'advanced') {
      payload = await advancedAnalytics(date_range_start, date_range_end)
    } else {
      payload = await analytics(date_range_start, date_range_end, breakdown)
    }
    console.log('Payload returned from analytics:', payload)

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

async function advancedAnalytics(date_range_start, date_range_end) {
  // Parallelize database calls
  const [rescues, transfers, organizations, locations] = await Promise.all([
    fetchFilteredData(
      COLLECTIONS.RESCUES,
      date_range_start,
      date_range_end,
      STATUSES.COMPLETED
    ),
    fetchFilteredData(
      COLLECTIONS.TRANSFERS,
      date_range_start,
      date_range_end,
      STATUSES.COMPLETED
    ),
    fetchCollection(COLLECTIONS.ORGANIZATIONS),
    fetchCollection(COLLECTIONS.LOCATIONS),
  ])

  // Process transfers data
  const collections = transfers.filter(
    s => s.type === TRANSFER_TYPES.COLLECTION
  )
  const distributions = transfers.filter(
    s => s.type === TRANSFER_TYPES.DISTRIBUTION
  )

  return {
    rescues,
    transfers,
    organizations,
    locations,
    collections,
    distributions,
  }
}

async function analytics(date_range_start, date_range_end, breakdown) {
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
  const [rescues, transfers, organizations, handlers] = await Promise.all([
    fetchData(COLLECTIONS.RESCUES, STATUSES.COMPLETED),
    fetchData(COLLECTIONS.TRANSFERS, STATUSES.COMPLETED),
    fetchCollection(COLLECTIONS.ORGANIZATIONS),
    fetchCollection(COLLECTIONS.PUBLIC_PROFILES),
  ])

  const collections = transfers.filter(
    s => s.type === TRANSFER_TYPES.COLLECTION
  )
  const distributions = transfers.filter(
    s => s.type === TRANSFER_TYPES.DISTRIBUTION
  )

  console.log('DATA:', rescues.length, transfers.length, organizations.length)

  const {
    total_weight,
    total_categorized_weight,
    retail_value,
    fair_market_value,
    emissions_reduced,
  } = calculateMetrics(distributions, organizations)

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
        return await breakdownByFoodCategory(distributions)
      case 'Location Type':
        return await breakdownByLocationType(distributions, organizations)
      case 'Rescue Type':
        return await breakdownByDonorRescueType(rescues, organizations)
      case 'Recipient Type':
        return breakdownByRecipientType(distributions, organizations)
      case 'Location and Rescue Type':
        return await breakdownByLocationAndRescueType(
          rescues,
          distributions,
          organizations
        )
      case 'Donor':
        return breakdownByDonor(collections, organizations)
      case 'Recipient':
        return breakdownByRecipient(distributions, organizations)
      case 'Driver':
        return breakdownByDriver(distributions, handlers)
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

const isEligibleOrg = orgSubtype => !['holding', 'compost'].includes(orgSubtype)

function calculateMetrics(distributions, organizations) {
  let total_weight = 0,
    total_categorized_weight = 0,
    retail_value = 0,
    fair_market_value = 0,
    emissions_reduced = 0

  const orgSubtypes = new Map(organizations.map(o => [o.id, o.subtype]))

  for (const distribution of distributions) {
    // Check if the organization is valid (not holding or compost)
    if (isEligibleOrg(orgSubtypes.get(distribution.organization_id))) {
      const distributionWeight = distribution.total_weight || 0
      total_weight += distributionWeight

      for (const category of FOOD_CATEGORIES) {
        const categoryWeight = distribution.categorized_weight[category] || 0
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

function breakdownByFoodCategory(distributions) {
  const categories = {
    ...FOOD_CATEGORIES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}), // eslint-disable-line
  }
  for (const category of FOOD_CATEGORIES) {
    categories[category] = distributions.reduce(
      (total, curr) => total + (curr.categorized_weight[category] || 0),
      0
    )
  }
  return sortObjectByValues(categories)
}

async function breakdownByDonorRescueType(rescues, organizations) {
  const totalWeights = {
    retail: 0,
    wholesale: 0,
    direct_link: 0,
  }

  const allTransferIds = new Set(rescues.flatMap(r => r.transfer_ids))

  // Fetch all transfer data in parallel
  const transfers = await getAllTransferData([...allTransferIds])

  const orgsMap = new Map(organizations.map(org => [org.id, org]))

  rescues.forEach(parentRescue => {
    parentRescue.transfer_ids.forEach(transferId => {
      const transfer = transfers.get(transferId)
      if (transfer && transfer.type === TRANSFER_TYPES.DISTRIBUTION) {
        const org = orgsMap.get(transfer.organization_id)
        if (org && isEligibleOrg(org.subtype)) {
          const weightToAdd = transfer.total_weight || 0
          totalWeights[parentRescue.type] += weightToAdd
        }
      }
    })
  })

  return totalWeights
}

async function breakdownByLocationType(transfers, organizations) {
  const totalWeightsByLocation = {}

  const orgsMap = new Map(organizations.map(org => [org.id, org]))

  transfers.forEach(transfer => {
    if (transfer.type === TRANSFER_TYPES.DISTRIBUTION) {
      const org = orgsMap.get(transfer.organization_id)
      if (org && isEligibleOrg(org.subtype)) {
        const tags = org.tags || []
        const weightToAdd = transfer.total_weight || 0

        tags.forEach(tag => {
          const key = tag.toLowerCase().replace(/\s+/g, '_')
          // Initialize the key in the totalWeightsByLocation if it doesn't exist
          if (!totalWeightsByLocation[key]) {
            totalWeightsByLocation[key] = 0
          }
          // Add the weight to the appropriate tag
          totalWeightsByLocation[key] += weightToAdd
        })

        // If there are no tags, add the weight to 'other'
        if (tags.length === 0) {
          totalWeightsByLocation['other'] =
            (totalWeightsByLocation['other'] || 0) + weightToAdd
        }
      }
    }
  })

  return totalWeightsByLocation
}

async function breakdownByLocationAndRescueType(
  rescues,
  transfers,
  organizations
) {
  const categorizedWeights = {
    wholesale_pwpm: 0,
    wholesale_hunts_point: 0,
    direct_link_pwpm: 0,
    direct_link_hunts_point: 0,
    retail_pwpm: 0,
    retail_hunts_point: 0,
  }

  const orgsMap = new Map(organizations.map(org => [org.id, org]))

  const rescuesMap = new Map(rescues.map(rescue => [rescue.id, rescue]))

  transfers.forEach(transfer => {
    if (transfer.type === TRANSFER_TYPES.DISTRIBUTION) {
      const org = orgsMap.get(transfer.organization_id)
      if (org && isEligibleOrg(org.subtype)) {
        const tags = org.tags || []
        const weightToAdd = transfer.total_weight || 0
        const rescue = rescuesMap.get(transfer.rescue_id)

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
  })

  return categorizedWeights
}

async function getAllTransferData(transferIds) {
  const MAX_BATCH_SIZE = 30
  let transferData = new Map()

  // parallel fetching
  const batches = []
  for (let i = 0; i < transferIds.length; i += MAX_BATCH_SIZE) {
    const batch = transferIds.slice(i, i + MAX_BATCH_SIZE)
    batches.push(fetchBatch(batch))
  }

  await Promise.all(batches)

  return transferData

  async function fetchBatch(batch) {
    try {
      const docs = await db
        .collection(COLLECTIONS.TRANSFERS)
        .where('id', 'in', batch)
        .get()
      docs.docs.forEach(doc => transferData.set(doc.id, doc.data()))
    } catch (e) {
      console.error('Error fetching transfer data for batch:', e)
    }
  }
}

function breakdownByRecipientType(distributions, organizations) {
  // Map organizations by ID for quick access
  const orgMap = organizations.reduce((acc, org) => {
    acc[org.id] = org
    return acc
  }, {})

  // Initialize categories
  const categories = RECIPIENT_SUB_TYPES.reduce((acc, subtype) => {
    acc[subtype] = 0
    return acc
  }, {})

  for (const distribution of distributions) {
    const org = orgMap[distribution.organization_id]
    if (org && org.subtype) {
      try {
        categories[org.subtype] += distribution.total_weight || 0
      } catch (e) {
        console.error('Error processing distribution:', distribution, e)
      }
    }
  }

  return sortObjectByValues(categories)
}

function breakdownByDonor(collections, organizations) {
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

function breakdownByRecipient(distributions, organizations) {
  // Create a map for quick organization lookup
  const orgMap = organizations.reduce((map, org) => {
    map[org.id] = org
    return map
  }, {})

  const recipients = {}

  for (const distribution of distributions) {
    const org = orgMap[distribution.organization_id]
    if (org && org.name) {
      recipients[org.name] =
        (recipients[org.name] || 0) + (distribution.total_weight || 0)
    } else {
      console.error(
        'Unable to find organization or name missing:',
        distribution
      )
    }
  }

  return sortObjectByValues(recipients)
}

function breakdownByDriver(distributions, handlers) {
  const recipients = {}
  for (const d of distributions) {
    try {
      const driver = handlers.find(o => o.id === d.handler_id)
      const { name } = driver
      recipients[name] = (recipients[name] || 0) + (d.total_weight || 0)
    } catch (e) {
      console.error(
        'Unable to add delivery to driver totals:',
        JSON.stringify(d)
      )
    }
  }
  return sortObjectByValues(recipients)
}

function sortObjectByValues(object) {
  return Object.entries(object)
    .sort(([, a], [, b]) => b - a)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {})
}

exports.analyticsEndpoint = analyticsEndpoint
exports.analytics = analytics
