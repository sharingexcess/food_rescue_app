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
  const [transfers, organizations, handlers] = await Promise.all([
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

  console.log('DATA:', transfers.length, organizations.length)

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
        return await breakdownByFoodCategory(distributions, organizations)
      case 'Rescue Type':
        return await breakdownByRescueType(distributions, organizations)
      case 'Location Type':
        return await breakdownByLocationType(distributions, organizations)
      case 'Recipient Type':
        return await breakdownByRecipientType(distributions, organizations)
      case 'Location and Rescue Type':
        return await breakdownByLocationAndRescueType(
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

function breakdownByFoodCategory(distributions, organizations) {
  const categories = {
    ...FOOD_CATEGORIES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}), // eslint-disable-line
  }

  const orgSubtypes = new Map(organizations.map(o => [o.id, o.subtype]))

  for (const category of FOOD_CATEGORIES) {
    categories[category] = distributions.reduce(
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

async function fetchRescueDataInBatches(distributionRescueIds, batchSize = 30) {
  const batches = []
  for (let i = 0; i < distributionRescueIds.length; i += batchSize) {
    const batch = distributionRescueIds.slice(i, i + batchSize)
    batches.push(Promise.all(batch.map(rescue_id => getRescueData(rescue_id))))
  }
  return (await Promise.all(batches)).flat()
}

async function breakdownByRescueType(distributions, organizations) {
  const RESCUE_TYPES = ['retail', 'wholesale', 'direct_link']
  const categories = RESCUE_TYPES.reduce(
    (acc, curr) => ({ ...acc, [curr]: 0 }),
    {}
  )

  const orgSubtypes = new Map(organizations.map(o => [o.id, o.subtype]))

  // Create a unique set of rescue_ids from distributions
  const rescueIds = [...new Set(distributions.map(d => d.rescue_id))]

  // Use fetchRescueDataInBatches to get data in batches
  const rescueDataResults = await fetchRescueDataInBatches(rescueIds)
  const rescueDataMap = new Map(
    rescueDataResults.map((rescue, index) => [rescueIds[index], rescue.data()])
  )

  const rescue_count = rescueDataResults.length

  distributions.forEach(distribution => {
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

async function breakdownByLocationType(distributions, organizations) {
  const locationCategories = {
    hunts_point: 0,
    pwpm: 0,
    other: 0,
  }

  const orgTags = new Map(organizations.map(o => [o.id, o.tags]))
  const orgSubtypes = new Map(organizations.map(o => [o.id, o.subtype]))

  for (const distribution of distributions) {
    const org = organizations.find(o => o.id === distribution.organization_id)
    if (org && isEligibleOrg(orgSubtypes.get(org.id))) {
      const tags = orgTags.get(org.id) || []
      const weightToAdd = distribution.total_weight || 0

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

function breakdownByDriver(distributions, handlers) {
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
