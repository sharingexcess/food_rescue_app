const moment = require('moment')
const { performance } = require('perf_hooks')
const {
  db,
  formatDocumentTimestamps,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')

async function stopsEndpoint(request, response, next) {
  try {
    console.log('INVOKING ENDPOINT: stops()\n', 'params:', request.query)
    const {
      type,
      date,
      date_range_start,
      date_range_end,
      status,
      handler_id,
      organization_id,
      limit,
      start_after,
      rescue_type,
      organization_tag,
    } = request.query

    const requestIsAuthenticated = await authenticateRequest(
      request.get('accessToken'),
      user => user.permission
    )

    if (!requestIsAuthenticated) {
      rejectUnauthorizedRequest(response)
      return
    }
    const stops = await getStops(
      type,
      date,
      date_range_start,
      date_range_end,
      status,
      handler_id,
      organization_id,
      start_after,
      rescue_type,
      limit,
      organization_tag
    )
    response.status(200).send(JSON.stringify(stops))
  } catch (e) {
    next(e)
  }
}

async function getStops(
  type,
  date,
  date_range_start,
  date_range_end,
  status,
  handler_id,
  organization_id,
  start_after,
  rescue_type,
  limit,
  organization_tag
) {
  const start = performance.now()
  let stops = []

  let stops_query = db.collection('stops')

  let start_after_ref
  if (start_after) {
    await db
      .collection('stops')
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
    stops_query = stops_query
      .where('timestamp_scheduled_start', '>=', start)
      .where('timestamp_scheduled_start', '<=', end)
  }

  if (date && !(date_range_start & date_range_end)) {
    const start = new Date(date)
    const end = moment(start).add(24, 'hours').toDate()
    console.log(start, end)
    stops_query = stops_query
      .where('timestamp_scheduled_start', '>=', start)
      .where('timestamp_scheduled_start', '<=', end)
  }

  if (type) {
    stops_query = stops_query.where('type', '==', type)
  }

  if (handler_id) {
    stops_query = stops_query.where('handler_id', '==', handler_id)
  }

  if (status) {
    stops_query = stops_query.where('status', '==', status)
  }

  if (organization_id) {
    stops_query = stops_query.where('organization_id', '==', organization_id)
  }

  if (rescue_type) {
    stops_query = stops_query.where('rescue_type', '==', rescue_type)
  }

  if (limit) {
    stops_query = stops_query.limit(parseInt(limit))
  }

  if (start_after) {
    stops_query = stops_query
      .orderBy('timestamp_scheduled_start', 'desc')
      .startAfter(start_after_ref)
  } else {
    stops_query = stops_query.orderBy('timestamp_scheduled_start', 'desc')
  }

  // execute stops query

  await stops_query.get().then(snapshot => {
    snapshot.forEach(doc =>
      stops.push({ ...formatDocumentTimestamps(doc.data()) })
    )
  })

  console.log(
    'finished stops query:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  // execute query for organization and location for each stop

  await Promise.all(
    stops
      .map(stop => [
        db
          .collection('public_profiles')
          .doc(stop.handler_id)
          .get()
          .then(doc => {
            const handler = formatDocumentTimestamps(doc.data())
            stop.handler = handler
          }),
        db
          .collection('organizations')
          .doc(stop.organization_id)
          .get()
          .then(doc => {
            const org = formatDocumentTimestamps(doc.data())
            stop.organization = org
          }),
        db
          .collection('locations')
          .doc(stop.location_id)
          .get()
          .then(doc => {
            const loc = formatDocumentTimestamps(doc.data())
            stop.location = loc
          }),
      ])
      .flat()
  )

  if (organization_tag) {
    stops = stops.filter(stop => {
      return stop.organization.tags?.includes(organization_tag)
    })
  }

  console.log(
    'finished org/loc queries:',
    (performance.now() - start) / 1000,
    'seconds'
  )

  console.log(
    'returning stops:',
    stops.map(i => i.id)
  )

  console.log(
    'getStops execution time:',
    (performance.now() - start) / 1000,
    'seconds'
  )
  return stops
}

exports.stopsEndpoint = stopsEndpoint
exports.getStops = getStops
