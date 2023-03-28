const {
  db,
  authenticateRequest,
  rejectUnauthorizedRequest,
  fetchCollection,
  COLLECTIONS,
  TRANSFER_TYPES,
  STATUSES,
  RECIPIENT_SUB_TYPES,
} = require('../../../helpers')

const moment = require('moment')

async function reportsEndpoint(request, response, next) {
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

      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        () => false // only approve requests from retool
      )

      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }
      const report = await generateReport(
        date_range_start,
        date_range_end,
        breakdown
      )

      response.status(200).send(JSON.stringify(report))
      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      next(e)
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
  let distributions = []
  await db
    .collection(COLLECTIONS.TRANSFERS)
    .where('type', '==', TRANSFER_TYPES.DISTRIBUTION)
    .where('status', '==', STATUSES.COMPLETED)
    .where(
      'timestamp_completed',
      '>=',
      new Date(date_range_start).toISOString()
    )
    .where('timestamp_completed', '<=', new Date(date_range_end).toISOString())
    .get()
    .then(snapshot => snapshot.forEach(doc => distributions.push(doc.data())))

  const organizations = await fetchCollection(COLLECTIONS.ORGANIZATIONS)

  distributions = distributions.filter(d => {
    const org = organizations.find(o => o.id === d.organization_id)
    return ![RECIPIENT_SUB_TYPES.HOLDING, RECIPIENT_SUB_TYPES.COMPOST].includes(
      org.subtype
    )
  })

  console.log(
    'Got distributions\n',
    'total:',
    distributions.length,
    distributions[0]
  )

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
      for (const distribution of distributions) {
        const distributionTimestamp = new Date(distribution.timestamp_completed)
        //Get Month and Year of current distribution
        const distributionTimestampMonth = moment(distributionTimestamp).format(
          'MMM'
        )
        const distributionTimestampYear = moment(distributionTimestamp).format(
          'yyy'
        )
        // console.log(
        //   'Delivery month and year:',
        //   distributionTimestampMonth,
        //   distributionTimestampYear
        // )
        for (const bucket of buckets) {
          if (
            bucket.label === distributionTimestampMonth &&
            bucket.year == distributionTimestampYear
          ) {
            //add distribution weight into value
            console.log('Delivery date:', distributionTimestamp)
            console.log('Bucket Month and Year:', bucket.label, bucket.year)
            bucket.value += distribution.total_weight
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
          label: moment(current_date).format('ddd, M/D'),
          value: 0,
        })
        current_date = moment(current_date).add(1, 'days').toDate()
      }

      //populate buckets
      for (const distribution of distributions) {
        const distributionTimestamp = new Date(distribution.timestamp_completed)
        const distributionTimestampString = moment(
          distributionTimestamp
        ).format('ddd, M/D')
        for (const bucket of buckets) {
          if (bucket.label === distributionTimestampString) {
            bucket.value += distribution.total_weight
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
exports.generateReport = generateReport
