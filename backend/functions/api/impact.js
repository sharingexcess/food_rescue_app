const {
  db,
  fetchCollection,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')
var moment = require('moment-timezone')

exports.impact = async (request, response) => {
  return new Promise(async resolve => {
    console.log('INVOKING ENDPOINT: impact()\n', 'params:', request.query)

    const { user_id } = request.query

    const requestIsAuthenticated = await authenticateRequest(
      request.get('accessToken'),
      user => user_id === user.id
    )

    if (!requestIsAuthenticated) {
      rejectUnauthorizedRequest(response)
      return
    }

    let rescues = []
    await db
      .collection('rescues')
      .where('handler_id', '==', user_id)
      .get()
      .then(snapshot => snapshot.forEach(doc => rescues.push(doc.data())))
    rescues = rescues.filter(i => i.status === 'completed')

    let stops = []
    await db
      .collection('stops')
      .where('handler_id', '==', user_id)
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
    console.log('Pickup stops:', pickups)
    const deliveries = filteredStops.filter(s => s.type === 'delivery')
    console.log('Delivery stops:', pickups)
    const total_weight = calculateMetrics(deliveries)

    const poundsByMonth = calcPoundsByMonth(deliveries)
    const donors = breakdownByDonor(pickups, organizations)
    const recipients = breakdownByDonor(deliveries, organizations)
    const payload = {
      total_weight,
      poundsByMonth,
      donors,
      recipients,
    }
    console.log('Paylod:', payload)
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

function calcPoundsByMonth(deliveries) {
  const poundsByMonth = []
  for (let i = 11; i >= 0; i--) {
    const range_start = moment().subtract(i, 'months').startOf('month').toDate()
    const range_end = moment()
      .subtract(i - 1, 'months')
      .startOf('month')
      .toDate()
    const filterByDateRange = delivery => {
      if (!delivery.timestamp_logged_finish) return false
      const finished = delivery.timestamp_logged_finish.toDate
        ? delivery.timestamp_logged_finish.toDate()
        : new Date(delivery.timestamp_logged_finish)
      return finished > range_start && finished < range_end
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
