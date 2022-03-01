const { db, fetchCollection } = require('./helpers')
const express = require('express')
const cors = require('cors')
var moment = require('moment-timezone')

const myStats_routes = express()
myStats_routes.use(cors({ origin: true }))
myStats_routes.get('/', handleMyStats)
exports.myStats = myStats_routes

async function handleMyStats(request, response) {
  return new Promise(async resolve => {
    console.log('running myStats')
    const { user } = request.query
    console.log('user:', user)

    let rescues = []
    await db
      .collection('rescues')
      .where('handler_id', '==', user)
      .get()
      .then(snapshot => snapshot.forEach(doc => rescues.push(doc.data())))
    rescues = rescues.filter(i => i.status === 'completed')

    let stops = []
    await db
      .collection('stops')
      .where('handler_id', '==', user)
      .get()
      .then(snapshot => snapshot.forEach(doc => stops.push(doc.data())))
    stops = stops.filter(i => {
      const rescue = rescues.find(r => r.id === i.rescue_id)
      if (!rescue) {
        return false
      }
      return i.status === 'completed' && rescue.status === 'completed'
    })

    const organizations = await fetchCollection('organizations')
    // IGNORE ANY DELIVERIES TO HOLDING ORGANIZATIONS - this means they have not reached a final end org
    filteredStops = stops.filter(d => {
      const org = organizations.find(o => o.id === d.organization_id)
      return org.subtype !== 'holding'
    })

    const pickups = filteredStops.filter(s => s.type === 'pickup')
    const deliveries = filteredStops.filter(s => s.type === 'delivery')

    console.log('DATA:', filteredStops.length, organizations.length)

    const total_weight = calculateMetrics(deliveries)

    // console.log(
    //   'METRICS:',
    //   total_weight,
    //   total_categorized_weight,
    //   retail_value,
    //   fair_market_value,
    //   emissions_reduced
    // )
    const poundsByMonth = calcPoundsByMonth(deliveries)
    const donors = breakdownByDonor(pickups, organizations)
    const recipients = breakdownByDonor(deliveries, organizations)
    const payload = {
      total_weight,
      poundsByMonth,
      donors,
      recipients,
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

function calculateMetrics(deliveries) {
  const total_weight = deliveries.reduce(
    (total, curr) => total + (curr.impact_data_total_weight || 0),
    0
  )
  return total_weight
}

function breakdownByDonor(pickups, organizations) {
  // const donors = {}
  // for (const p of pickups) {
  //   try {
  //     const organization = organizations.find(o => o.id === p.organization_id)
  //     const { name } = organization
  //     donors[name] = (donors[name] || 0) + (p.impact_data_total_weight || 0)
  //   } catch (e) {
  //     console.error('Unable to add pickup to donor totals:', JSON.stringify(p))
  //   }
  // }

  const poundsByOrgId = []
  for (const pickup of pickups) {
    if (poundsByOrgId[pickup.organization_id]) {
      poundsByOrgId[pickup.organization_id] =
        poundsByOrgId[pickup.organization_id] +
        (pickup.impact_data_total_weight || 0)
    } else {
      poundsByOrgId[pickup.organization_id] =
        pickup.impact_data_total_weight || 0
    }
  }
  const poundsByOrg = []
  for (const org_id in poundsByOrgId) {
    const organization = organizations.find(i => i.id === org_id)
    organization &&
      poundsByOrg.push({
        name: organization.name,
        weight: poundsByOrgId[org_id],
      })
  }
  const sortedByWeight = poundsByOrg.sort((a, b) => b.weight - a.weight)

  return sortedByWeight
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

function sortObjectByValues(object) {
  return Object.entries(object)
    .sort(([, a], [, b]) => b - a)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {})
}

// const [poundsByMonth, setPoundsByMonth] = useState()
function calcPoundsByMonth(deliveries) {
  const poundsByMonth = []
  for (let i = 11; i >= 0; i--) {
    const range_start = moment().subtract(i, 'months').startOf('month').toDate()
    const range_end = moment()
      .subtract(i - 1, 'months')
      .startOf('month')
      .toDate()
    const filterByDateRange = i => {
      console.log(i)
      return (
        i.timestamp_logged_finish.toDate() > range_start &&
        i.timestamp_logged_finish.toDate() < range_end
      )
    }
    const stopsInMonth = deliveries.filter(filterByDateRange)
    const totalWeightInStops = stopsInMonth.reduce(
      (a, b) => a + (b.impact_data_total_weight || 0),
      0
    )
    poundsByMonth.push({
      name: formatTimestamp(range_start, 'MMM'),
      date: formatTimestamp(range_start, 'MMMM YYYY'),
      weight: totalWeightInStops,
    })
  }
  return poundsByMonth
}

const formatTimestamp = (t, format) =>
  moment(t instanceof Date ? t : t.toDate()).format(format)
