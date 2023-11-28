const {
  db,
  DONOR_RESCUE_TYPES,
  DONOR_SUB_TYPES,
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
async function advancedAnalytics(date_range_start, date_range_end) {
  let rescues = []
  await db
    .collection(COLLECTIONS.RESCUES)
    .where(
      'timestamp_completed',
      '>=',
      new Date(date_range_start).toISOString()
    )
    .where('timestamp_completed', '<=', new Date(date_range_end).toISOString())
    .get()
    .then(snapshot => snapshot.forEach(doc => rescues.push(doc.data())))
  rescues = rescues.filter(i => i.status === STATUSES.COMPLETED)

  let transfers = []
  await db
    .collection(COLLECTIONS.TRANSFERS)
    .where(
      'timestamp_completed',
      '>=',
      new Date(date_range_start).toISOString()
    )
    .where('timestamp_completed', '<=', new Date(date_range_end).toISOString())
    .get()
    .then(snapshot => snapshot.forEach(doc => transfers.push(doc.data())))
  transfers = transfers.filter(i => i.status === STATUSES.COMPLETED)

  const organizations = await fetchCollection(COLLECTIONS.ORGANIZATIONS)
  const locations = await fetchCollection(COLLECTIONS.LOCATIONS)

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

  let rescues = []
  await db
    .collection(COLLECTIONS.RESCUES)
    .where(
      'timestamp_completed',
      '>=',
      new Date(date_range_start).toISOString()
    )
    .where('timestamp_completed', '<=', new Date(date_range_end).toISOString())
    .get()
    .then(snapshot => snapshot.forEach(doc => rescues.push(doc.data())))
  rescues = rescues.filter(i => i.status === STATUSES.COMPLETED)

  let transfers = []
  await db
    .collection(COLLECTIONS.TRANSFERS)
    .where(
      'timestamp_completed',
      '>=',
      new Date(date_range_start).toISOString()
    )
    .where('timestamp_completed', '<=', new Date(date_range_end).toISOString())
    .get()
    .then(snapshot => snapshot.forEach(doc => transfers.push(doc.data())))
  transfers = transfers.filter(i => i.status === STATUSES.COMPLETED)

  const organizations = await fetchCollection(COLLECTIONS.ORGANIZATIONS)
  const handlers = await fetchCollection(COLLECTIONS.PUBLIC_PROFILES)

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

  switch (breakdown) {
    case 'Food Category': {
      console.log('Handling breakdown by food category')
      const payload = {
        total_weight,
        total_categorized_weight,
        retail_value,
        fair_market_value,
        emissions_reduced,
        view_data: breakdownByFoodCategory(distributions),
      }
      console.log('returning payload:', payload)
      return payload
    }
    case 'Donor Type': {
      console.log('Handling breakdown by donor type')
      const payload = {
        total_weight,
        total_categorized_weight,
        retail_value,
        fair_market_value,
        emissions_reduced,
        view_data: await breakdownByDonorRescueType(rescues, organizations),
      }
      console.log('returning payload:', payload)
      return payload
    }
    case 'Recipient Type': {
      console.log('Handling breakdown by recipient type')
      const payload = {
        total_weight,
        total_categorized_weight,
        retail_value,
        fair_market_value,
        emissions_reduced,
        view_data: breakdownByRecipientType(distributions, organizations),
      }
      console.log('returning payload:', payload)
      return payload
    }
    case 'Donor': {
      console.log('Handling breakdown by donor')
      const payload = {
        total_weight,
        total_categorized_weight,
        retail_value,
        fair_market_value,
        emissions_reduced,
        view_data: breakdownByDonor(collections, organizations),
      }
      console.log('returning payload:', payload)
      return payload
    }
    case 'Recipient': {
      console.log('Handling breakdown by recipient')
      const payload = {
        total_weight,
        total_categorized_weight,
        retail_value,
        fair_market_value,
        emissions_reduced,
        view_data: breakdownByRecipient(distributions, organizations),
      }
      console.log('returning payload:', payload)
      return payload
    }
    case 'Driver': {
      console.log('Handling breakdown by driver')
      const payload = {
        total_weight,
        total_categorized_weight,
        retail_value,
        fair_market_value,
        emissions_reduced,
        view_data: breakdownByDriver(distributions, handlers),
      }
      console.log('returning payload:', payload)
      return payload
    }
    default: {
      return null
    }
  }
}

function calculateMetrics(distributions, organizations) {
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

function breakdownByDonorType(collections, organizations) {
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

async function breakdownByDonorRescueType(rescues, organizations) {
  const categories = DONOR_RESCUE_TYPES.reduce(
    (acc, type) => ({ ...acc, [type]: 0 }),
    {}
  )

  const isEligibleOrg = orgSubtype =>
    ![RECIPIENT_SUB_TYPES.HOLDING, RECIPIENT_SUB_TYPES.COMPOST].includes(
      orgSubtype
    )

  for (const rescue of rescues) {
    try {
      if (['wholesale', 'direct_link', 'retail'].includes(rescue.type)) {
        const transfers = await Promise.all(
          rescue.transfer_ids.map(getTransferData)
        )

        const total_weight = transfers.reduce((acc, transfer) => {
          if (transfer.type === 'distribution') {
            const org = organizations.find(
              o => o.id === transfer.organization_id
            )
            if (org && isEligibleOrg(org.subtype)) {
              return acc + (transfer.total_weight || 0)
            }
          }
          return acc
        }, 0)

        categories[rescue.type] += total_weight
      }
    } catch (e) {
      console.error('Error processing rescue:', JSON.stringify(rescue), e)
    }
  }

  return sortObjectByValues(categories)
}

async function getTransferData(transferId) {
  try {
    const doc = await db.collection(COLLECTIONS.TRANSFERS).doc(transferId).get()
    return doc.data() || {}
  } catch (e) {
    console.error('Error fetching transfer data:', transferId, e)
    return {}
  }
}

function breakdownByRecipientType(distributions, organizations) {
  const categories = {
    ...RECIPIENT_SUB_TYPES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}), // eslint-disable-line
  }
  for (const d of distributions) {
    try {
      const organization = organizations.find(o => o.id === d.organization_id)
      const { subtype } = organization
      console.log('found org:', organization.name, organization.subtype)
      categories[subtype] += d.total_weight || 0
    } catch (e) {
      console.error(
        'Unable to add delivery to recipient type totals:',
        JSON.stringify(d)
      )
    }
  }
  return sortObjectByValues(categories)
}

function breakdownByDonor(collections, organizations) {
  const donors = {}
  for (const p of collections) {
    try {
      const organization = organizations.find(o => o.id === p.organization_id)
      const { name } = organization
      donors[name] = (donors[name] || 0) + (p.total_weight || 0)
    } catch (e) {
      console.error('Unable to add pickup to donor totals:', JSON.stringify(p))
    }
  }
  return sortObjectByValues(donors)
}

function breakdownByRecipient(distributions, organizations) {
  const recipients = {}
  for (const d of distributions) {
    try {
      const organization = organizations.find(o => o.id === d.organization_id)
      const { name } = organization
      recipients[name] = (recipients[name] || 0) + (d.total_weight || 0)
    } catch (e) {
      console.error(
        'Unable to add pickup to recipient totals:',
        JSON.stringify(d)
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
