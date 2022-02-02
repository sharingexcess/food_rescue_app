const {
  db,
  DONOR_SUB_TYPES,
  EMISSIONS_COEFFICIENT,
  FAIR_MARKET_VALUES,
  fetchCollection,
  FOOD_CATEGORIES,
  RECIPIENT_SUB_TYPES,
  RETAIL_VALUES,
} = require('./helpers')
const express = require('express')
const cors = require('cors')

const analytics_routes = express()
analytics_routes.use(cors({ origin: true }))
analytics_routes.get('/', handleAnalytics)
exports.analytics = analytics_routes

async function handleAnalytics(request, response) {
  return new Promise(async resolve => {
    console.log('running analytics')
    const { date_range_start, date_range_end, breakdown } = request.query
    console.log(date_range_start, date_range_end, breakdown)

    let rescues = []
    await db
      .collection('rescues')
      .where('timestamp_scheduled_start', '>=', new Date(date_range_start))
      .where('timestamp_scheduled_start', '<=', new Date(date_range_end))
      .get()
      .then(snapshot => snapshot.forEach(doc => rescues.push(doc.data())))
    rescues = rescues.filter(i => i.status === 'completed')

    let stops = []
    await db
      .collection('stops')
      .where('timestamp_scheduled_start', '>=', new Date(date_range_start))
      .where('timestamp_scheduled_start', '<=', new Date(date_range_end))
      .get()
      .then(snapshot => snapshot.forEach(doc => stops.push(doc.data())))
    stops = stops.filter(i => i.status === 'completed')

    const organizations = await fetchCollection('organizations')
    const users = await fetchCollection('users')

    const pickups = stops.filter(s => s.type === 'pickup')
    const deliveries = stops.filter(s => s.type === 'delivery')

    console.log('DATA:', rescues.length, stops.length, organizations.length)

    const {
      total_weight,
      total_categorized_weight,
      retail_value,
      fair_market_value,
      emissions_reduced,
    } = calculateMetrics(deliveries, organizations)

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
          view_data: breakdownByFoodCategory(deliveries),
        }
        console.log('returning payload:', payload)
        response.status(200).send(JSON.stringify(payload))
        resolve()
        return
      }
      case 'Donor Type': {
        console.log('Handling breakdown by donor type')
        const payload = {
          total_weight,
          total_categorized_weight,
          retail_value,
          fair_market_value,
          emissions_reduced,
          view_data: breakdownByDonorType(pickups, organizations),
        }
        console.log('returning payload:', payload)
        response.status(200).send(JSON.stringify(payload))
        resolve()
        return
      }
      case 'Recipient Type': {
        console.log('Handling breakdown by recipient type')
        const payload = {
          total_weight,
          total_categorized_weight,
          retail_value,
          fair_market_value,
          emissions_reduced,
          view_data: breakdownByRecipientType(deliveries, organizations),
        }
        console.log('returning payload:', payload)
        response.status(200).send(JSON.stringify(payload))
        resolve()
        return
      }
      case 'Donor': {
        console.log('Handling breakdown by donor')
        const payload = {
          total_weight,
          total_categorized_weight,
          retail_value,
          fair_market_value,
          emissions_reduced,
          view_data: breakdownByDonor(pickups, organizations),
        }
        console.log('returning payload:', payload)
        response.status(200).send(JSON.stringify(payload))
        resolve()
        return
      }
      case 'Recipient': {
        console.log('Handling breakdown by recipient')
        const payload = {
          total_weight,
          total_categorized_weight,
          retail_value,
          fair_market_value,
          emissions_reduced,
          view_data: breakdownByRecipient(deliveries, organizations),
        }
        console.log('returning payload:', payload)
        response.status(200).send(JSON.stringify(payload))
        resolve()
        return
      }
      case 'Driver': {
        console.log('Handling breakdown by driver')
        const payload = {
          total_weight,
          total_categorized_weight,
          retail_value,
          fair_market_value,
          emissions_reduced,
          view_data: breakdownByDriver(deliveries, users),
        }
        console.log('returning payload:', payload)
        response.status(200).send(JSON.stringify(payload))
        resolve()
        return
      }
      default: {
        response.status(500).send('No breakdown provided!')
        resolve()
      }
    }
  })
}

function calculateMetrics(deliveries, organizations) {
  // IGNORE ANY DELIVERIES TO HOLDING ORGANIZATIONS - this means they have not reached a final end org
  deliveries = deliveries.filter(d => {
    const org = organizations.find(o => o.id === d.organization_id)
    return org.subtype !== 'holding'
  })
  let total_categorized_weight = 0,
    retail_value = 0,
    fair_market_value = 0,
    emissions_reduced = 0
  const total_weight = deliveries.reduce(
    (total, curr) => total + (curr.impact_data_total_weight || 0),
    0
  )
  for (const category of FOOD_CATEGORIES) {
    const category_weight = deliveries.reduce(
      (total, curr) => total + (curr[category] || 0),
      0
    )
    total_categorized_weight += category_weight
    emissions_reduced += category_weight * EMISSIONS_COEFFICIENT
    retail_value += category_weight * EMISSIONS_COEFFICIENT
    fair_market_value += category_weight * FAIR_MARKET_VALUES[category]
  }
  // HANDLE RESCUES WHERE CATEGORIES WERE MEASURED IN BOXES INSTEAD OF POUNDS
  const non_categorized_weight = total_weight - total_categorized_weight
  console.log('NON CATEGORIZED:', non_categorized_weight)
  emissions_reduced += non_categorized_weight * EMISSIONS_COEFFICIENT
  retail_value += non_categorized_weight * RETAIL_VALUES.impact_data_mixed
  fair_market_value +=
    non_categorized_weight * FAIR_MARKET_VALUES.impact_data_mixed

  return {
    total_weight,
    total_categorized_weight,
    retail_value,
    fair_market_value,
    emissions_reduced,
  }
}

function breakdownByFoodCategory(deliveries) {
  const categories = {
    ...FOOD_CATEGORIES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}), // eslint-disable-line
  }
  for (const category of FOOD_CATEGORIES) {
    categories[category] = deliveries.reduce(
      (total, curr) => total + (curr[category] || 0),
      0
    )
  }
  return sortObjectByValues(categories)
}

function breakdownByDonorType(pickups, organizations) {
  const categories = {
    ...DONOR_SUB_TYPES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}), // eslint-disable-line
  }
  for (const p of pickups) {
    try {
      const organization = organizations.find(o => o.id === p.organization_id)
      const { subtype } = organization
      categories[subtype] += p.impact_data_total_weight || 0
    } catch (e) {
      console.error(
        'Unable to add pickup to donor type totals:',
        JSON.stringify(p)
      )
    }
  }
  return sortObjectByValues(categories)
}

function breakdownByRecipientType(deliveries, organizations) {
  const categories = {
    ...RECIPIENT_SUB_TYPES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}), // eslint-disable-line
  }
  for (const d of deliveries) {
    try {
      const organization = organizations.find(o => o.id === d.organization_id)
      const { subtype } = organization
      console.log('found org:', organization.name, organization.subtype)
      categories[subtype] += d.impact_data_total_weight || 0
    } catch (e) {
      console.error(
        'Unable to add delivery to recipient type totals:',
        JSON.stringify(d)
      )
    }
  }
  return sortObjectByValues(categories)
}

function breakdownByDonor(pickups, organizations) {
  const donors = {}
  for (const p of pickups) {
    try {
      const organization = organizations.find(o => o.id === p.organization_id)
      const { name } = organization
      donors[name] = (donors[name] || 0) + (p.impact_data_total_weight || 0)
    } catch (e) {
      console.error('Unable to add pickup to donor totals:', JSON.stringify(p))
    }
  }
  return sortObjectByValues(donors)
}

function breakdownByRecipient(deliveries, organizations) {
  const recipients = {}
  for (const d of deliveries) {
    try {
      const organization = organizations.find(o => o.id === d.organization_id)
      const { name } = organization
      recipients[name] =
        (recipients[name] || 0) + (d.impact_data_total_weight || 0)
    } catch (e) {
      console.error(
        'Unable to add pickup to recipient totals:',
        JSON.stringify(d)
      )
    }
  }
  return sortObjectByValues(recipients)
}

function breakdownByDriver(deliveries, users) {
  const recipients = {}
  for (const d of deliveries) {
    try {
      const driver = users.find(o => o.id === d.handler_id)
      const { name } = driver
      recipients[name] =
        (recipients[name] || 0) + (d.impact_data_total_weight || 0)
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
