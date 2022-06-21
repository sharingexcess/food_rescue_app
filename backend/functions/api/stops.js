const moment = require('moment')
const { performance } = require('perf_hooks')
const {
  db,
  formatDocumentTimestamps,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')

async function stopsEndpoint(request, response) {
  try {
    console.log('INVOKING ENDPOINT: stops()\n', 'params:', request.query)
    const {
      type,
      date,
      status,
      handler_id,
      organization_id,
      limit,
      start_after,
    } = request.query

    const requestIsAuthenticated = await authenticateRequest(
      request.get('accessToken'),
      user => user.is_admin || (handler_id && user.id === handler_id)
    )

    if (!requestIsAuthenticated) {
      rejectUnauthorizedRequest(response)
      return
    }
    const stops = await getStops(
      type,
      date,
      status,
      handler_id,
      organization_id,
      start_after,
      limit
    )
    response.status(200).send(JSON.stringify(stops))
  } catch (e) {
    console.error('Caught error:', e)
    response.status(500).send(e.toString())
  }
}

async function getStops(
  type,
  date,
  status,
  handler_id,
  organization_id,
  start_after,
  limit = 100
) {
  const start = performance.now()
  const stops = []

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

  if (date) {
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
      stops.push({ ...formatDocumentTimestamps(doc.data()), stops: [] })
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
          .collection('organizations')
          .doc(stop.organization_id)
          .get()
          .then(doc => {
            const org = formatDocumentTimestamps(doc.data())
            // console.log('got org', org)
            stop.organization = org
          }),
        db
          .collection('locations')
          .doc(stop.location_id)
          .get()
          .then(doc => {
            const loc = formatDocumentTimestamps(doc.data())
            // console.log('got loc', loc)
            stop.location = loc
          }),
      ])
      .flat()
  )

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