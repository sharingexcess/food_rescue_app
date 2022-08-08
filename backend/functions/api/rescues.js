const moment = require('moment')
const { performance } = require('perf_hooks')
const {
  db,
  formatDocumentTimestamps,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')

async function rescuesEndpoint(request, response) {
  try {
    console.log('INVOKING ENDPOINT: rescues()\n', 'params:', request.query)
    const {
      date,
      status,
      handler_id,
      limit,
      start_after,
      date_range_start,
      date_range_end,
    } = request.query

    const requestIsAuthenticated = await authenticateRequest(
      request.get('accessToken'),
      user =>
        user.is_admin ||
        (handler_id && user.id === handler_id) ||
        (user.is_driver && handler_id === 'null') // allow drivers search for available rescues
    )

    if (!requestIsAuthenticated) {
      rejectUnauthorizedRequest(response)
      return
    }
    const rescues = await getRescues(
      date,
      status,
      handler_id,
      start_after,
      limit,
      date_range_start,
      date_range_end
    )
    response.status(200).send(JSON.stringify(rescues))
  } catch (e) {
    console.error('Caught error:', e)
    response.status(500).send(e.toString())
  }
}

async function getRescues(
  date,
  status,
  handler_id,
  start_after,
  limit = 100,
  date_range_start,
  date_range_end
) {
  const start = performance.now()
  const rescues = []

  let rescues_query = db.collection('rescues')

  let start_after_ref
  if (start_after) {
    await db
      .collection('rescues')
      .doc(start_after)
      .get()
      .then(doc => {
        start_after_ref = doc
      })
  }

  // apply filters
  if (date_range_start && date_range_end) {
    const start = moment(date_range_start).startOf('day').toDate()
    const end = moment(date_range_end).endOf('day').toDate()
    console.log(start, end)
    rescues_query = rescues_query
      .where('timestamp_scheduled_start', '>=', start)
      .where('timestamp_scheduled_start', '<=', end)
  }

  if (date && !(date_range_start & date_range_end)) {
    const start = new Date(date)
    const end = moment(start).add(24, 'hours').toDate()
    console.log(start, end)
    rescues_query = rescues_query
      .where('timestamp_scheduled_start', '>=', start)
      .where('timestamp_scheduled_start', '<=', end)
  }

  // Note: Ryan hates that we have to do this.
  if (handler_id === 'null') {
    rescues_query = rescues_query.where('handler_id', '==', null)
  } else if (handler_id) {
    rescues_query = rescues_query.where('handler_id', '==', handler_id)
  }
  if (status) {
    rescues_query = rescues_query.where('status', '==', status)
  }

  if (limit && !(date_range_start && date_range_start)) {
    rescues_query = rescues_query.limit(parseInt(limit))
  }

  if (start_after) {
    rescues_query = rescues_query
      .orderBy('timestamp_scheduled_start', 'desc')
      .startAfter(start_after_ref)
  } else {
    rescues_query = rescues_query.orderBy('timestamp_scheduled_start', 'desc')
  }

  // execute rescues query

  await rescues_query.get().then(snapshot => {
    snapshot.forEach(doc =>
      rescues.push({ ...formatDocumentTimestamps(doc.data()), stops: [] })
    )
  })

  console.log(
    'finished rescue query:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  // execute query for all stops within rescues, and handler for rescue
  await Promise.all([
    ...rescues.map(rescue =>
      rescue.handler_id
        ? db
            .collection('users')
            .doc(rescue.handler_id)
            .get()
            .then(
              doc => (rescue.handler = formatDocumentTimestamps(doc.data()))
            )
        : null
    ),
    ...rescues.map(rescue =>
      db
        .collection('stops')
        .where('rescue_id', '==', rescue.id)
        .get()
        .then(snapshot =>
          snapshot.forEach(doc =>
            rescue.stops.push(formatDocumentTimestamps(doc.data()))
          )
        )
    ),
  ])

  console.log(
    'finished handler/stop queries:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  // execute query for organization and location for each stop

  await Promise.all(
    rescues
      .map(rescue => [
        ...rescue.stops.map(stop =>
          db
            .collection('organizations')
            .doc(stop.organization_id)
            .get()
            .then(doc => {
              const org = formatDocumentTimestamps(doc.data())
              // console.log('got org', org)
              stop.organization = org
            })
        ),
        ...rescue.stops.map(stop =>
          db
            .collection('locations')
            .doc(stop.location_id)
            .get()
            .then(doc => {
              const loc = formatDocumentTimestamps(doc.data())
              // console.log('got loc', loc)
              stop.location = loc
            })
        ),
      ])
      .flat()
  )

  console.log(
    'finished org/loc queries:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  console.log(
    'returning rescues:',
    rescues.map(i => i.id)
  )

  console.log(
    'getRescues execution time:',
    (performance.now() - start) / 1000,
    'seconds'
  )
  return rescues
}

exports.rescuesEndpoint = rescuesEndpoint
exports.getRescues = getRescues
