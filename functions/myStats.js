const { db, fetchCollection } = require('./helpers')
const express = require('express')
const cors = require('cors')

const myStats_routes = express()
myStats_routes.use(cors({ origin: true }))
myStats_routes.get('/', handleMyStats)
exports.myStats = myStats_routes

async function handleMyStats(request, response) {
  return new Promise(async resolve => {
    console.log('running myStats')
    const { user } = request.query
    console.log('user:', user)

    // let rescues = []
    // await db
    //   .collection('rescues')
    //   .where('handler_id', '==', new Date(date_range_start))
    //   .where('timestamp_scheduled_start', '<=', new Date(date_range_end))
    //   .get()
    //   .then(snapshot => snapshot.forEach(doc => rescues.push(doc.data())))
    // rescues = rescues.filter(i => i.status === 'completed')

    // let stops = []
    // await db
    //   .collection('stops')
    //   .where('timestamp_scheduled_start', '>=', new Date(date_range_start))
    //   .where('timestamp_scheduled_start', '<=', new Date(date_range_end))
    //   .get()
    //   .then(snapshot => snapshot.forEach(doc => stops.push(doc.data())))
    // stops = stops.filter(i => i.status === 'completed')

    // let poundsByMonth = []
    // await db.collection('rescues')

    // const organizations = await fetchCollection('organizations')
    // const users = await fetchCollection('users')

    // const pickups = stops.filter(s => s.type === 'pickup')
    // const deliveries = stops.filter(s => s.type === 'delivery')

    // console.log('DATA:', rescues.length, stops.length, organizations.length)

    // const { total_weight } = calculateMetrics(deliveries, organizations)

    // console.log(
    //   'METRICS:',
    //   total_weight,
    //   total_categorized_weight,
    //   retail_value,
    //   fair_market_value,
    //   emissions_reduced
    // )

    const total_weight = 100
    const payload = {
      total_weight,
      // total_impact,
      // impact_last_year,
      // rescues,
      // deliveries,
      // view_data: breakdownByDonor(deliveries, users),
    }
    console.log('returning payload:', payload)
    response.status(200).send(JSON.stringify(payload))
    resolve()
    return
  })
}

function calculateMetrics(deliveries, organizations) {
  // IGNORE ANY DELIVERIES TO HOLDING ORGANIZATIONS - this means they have not reached a final end org
  deliveries = deliveries.filter(d => {
    const org = organizations.find(o => o.id === d.organization_id)
    return org.subtype !== 'holding'
  })
  const total_weight = deliveries.reduce(
    (total, curr) => total + (curr.impact_data_total_weight || 0),
    0
  )
  return total_weight
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
