const {
  db,
  authenticateRequest,
  rejectUnauthorizedRequest,
  DONOR_SUB_TYPES,
  fetchCollection,
} = require('../../helpers')

const moment = require('moment')

async function reportsEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log('INVOKING ENDPOINT: reports()\n', 'params:', {
        ...request.params,
        ...request.query,
      })

      const {
        date_range_start,
        date_range_end,
        breakdown = 'month',
      } = request.query

      console.log(date_range_start, date_range_end, breakdown)

      if (!date_range_end || !date_range_start) {
        response
          .status(400)
          .send('No date range param received in request URL.')
        return
      }

      // const requestIsAuthenticated = await authenticateRequest(
      //   request.get('accessToken'),
      //   () => false // only approve requests from retool
      // )

      // if (!requestIsAuthenticated) {
      //   rejectUnauthorizedRequest(response)
      //   return
      // }
      const report = await generateReport(
        date_range_start,
        date_range_end,
        breakdown
      )

      response.status(200).send(JSON.stringify(report))
      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(e.toString())
    }
  })
}

async function generateReport(date_range_start, date_range_end, breakdown) {
  console.log(
    'running generateReport:',
    '\ndate_range_start:',
    date_range_start,
    '\ndate_range_end:',
    date_range_end,
    '\nbreakdown:',
    breakdown
  )
  let deliveries = []
  await db
    .collection('stops')
    .where('type', '==', 'delivery')
    .where('status', '==', 'completed')
    .where('timestamp_scheduled_start', '>=', new Date(date_range_start))
    .where('timestamp_scheduled_start', '<=', new Date(date_range_end))
    .get()
    .then(snapshot => snapshot.forEach(doc => deliveries.push(doc.data())))

  const organizations = await fetchCollection('organizations')

  deliveries = deliveries.filter(d => {
    const org = organizations.find(o => o.id === d.organization_id)
    return org.subtype !== 'holding'
  })

  console.log('Got Deliveries\n', 'total:', deliveries.length, deliveries[0])

  switch (breakdown) {
    case 'month': {
      console.log('handling breakdown by month')
      const buckets = []

      //initialize buckets
      let current_date = new Date(date_range_start)
      while (current_date < new Date(date_range_end)) {
        //create buckets with month, value, and year
        buckets.push({
          label: moment(current_date).startOf('month').format('MMM'),
          value: 0,
          year: current_date.getFullYear(),
        })
        current_date = moment(current_date).add(1, 'month').toDate()
      }
      console.log('initialized buckets:', buckets)

      //populate buckets
      for (const delivery of deliveries) {
        const deliveryTimestamp = delivery.timestamp_scheduled_start.toDate()
        //Get Month and Year of current delivery
        const deliveryTimestampMonth = moment(deliveryTimestamp).format('MMM')
        const deliveryTimestampYear = moment(deliveryTimestamp).format('yyy')
        console.log(
          'Delivery Month and year:',
          deliveryTimestampMonth,
          deliveryTimestampYear
        )
        for (const bucket of buckets) {
          if (
            bucket.label === deliveryTimestampMonth &&
            bucket.year == deliveryTimestampYear
          ) {
            //add delivery weight into value
            console.log('Delivery date:', deliveryTimestamp)
            console.log('Bucket Month and Year:', bucket.label, bucket.year)
            bucket.value += delivery.impact_data_total_weight
            break
          }
        }
      }
      console.log(buckets)
      return buckets
    }
    case 'day': {
      console.log('handling breakdown by day')
      const buckets = []

      //initialize buckets
      let current_date = new Date(date_range_start)
      while (current_date <= new Date(date_range_end)) {
        buckets.push({
          label: moment(current_date).format('MMM Do'),
          value: 0,
        })
        current_date = moment(current_date).add(1, 'days').toDate()
      }

      //populate buckets
      for (const delivery of deliveries) {
        const deliveryTimestamp = delivery.timestamp_scheduled_start.toDate()
        const deliveryTimestampString =
          moment(deliveryTimestamp).format('MMM Do')
        for (bucket of buckets) {
          if (bucket.label === deliveryTimestampString) {
            bucket.value += delivery.impact_data_total_weight
            break
          }
        }
      }
      console.log(buckets)

      return buckets
    }
    default:
      return null
  }
}

exports.reportsEndpoint = reportsEndpoint
