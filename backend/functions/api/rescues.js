const moment = require('moment')
const { performance } = require('perf_hooks')
const {
  db,
  fetchCollection,
  formatDocumentTimestamps,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')

async function rescuesEndpoint(request, response) {
  try {
    console.log('INVOKING ENDPOINT: rescues()\n', 'params:', request.query)
    const { date, status, handler_id, limit, start_after } = request.query

    const requestIsAuthenticated = await authenticateRequest(
      request.get('accessToken'),
      user => user.is_admin || (handler_id && user.id === handler_id)
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
      limit
    )
    response.status(200).send(JSON.stringify(rescues))
  } catch (e) {
    console.error('Caught error:', e)
    response.status(500).send(e.toString())
  }
}

async function getRescues(date, status, handler_id, start_after, limit = 100) {
  const start = performance.now()
  let organizations, locations, users
  const rescues = [],
    stops = []

  let rescues_query = db.collection('rescues')
  let stops_query = db.collection('stops')

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

  if (date) {
    const start = new Date(date)
    const end = moment(start).add(24, 'hours').toDate()
    console.log(start, end)
    rescues_query = rescues_query
      .where('timestamp_scheduled_start', '>=', start)
      .where('timestamp_scheduled_start', '<=', end)
    stops_query = stops_query
      .where('timestamp_scheduled_start', '>=', start)
      .where('timestamp_scheduled_start', '<=', end)
  }

  if (handler_id) {
    rescues_query = rescues_query.where('handler_id', '==', handler_id)
  }

  if (status) {
    rescues_query = rescues_query.where('status', '==', status)
  }

  if (limit) {
    rescues_query = rescues_query.limit(parseInt(limit))
  }

  if (start_after) {
    rescues_query = rescues_query
      .orderBy('timestamp_scheduled_start')
      .startAfter(start_after_ref)
  } else {
    rescues_query = rescues_query.orderBy('timestamp_scheduled_start', 'desc')
  }

  // execute db queries
  await Promise.all([
    fetchCollection('organizations').then(data => (organizations = data)),
    fetchCollection('locations').then(data => (locations = data)),
    fetchCollection('users').then(data => (users = data)),
    rescues_query.get().then(snapshot => {
      snapshot.forEach(doc =>
        rescues.push(formatDocumentTimestamps(doc.data()))
      )
    }),
    stops_query
      .get()
      .then(snapshot =>
        snapshot.forEach(doc =>
          stops.push(formatDocumentTimestamps(doc.data()))
        )
      ),
  ])

  // initialize stops array with length of stop_ids
  for (const rescue of rescues) {
    rescue.stops = []
    const rescue_stops = stops.filter(i => i.rescue_id === rescue.id)
    for (const s of rescue.stop_ids) {
      const stop = formatDocumentTimestamps(
        rescue_stops.find(i => i.id === s) || {}
      )
      stop.organization = formatDocumentTimestamps(
        organizations.find(o => o.id === stop.organization_id) || {}
      )
      stop.location = formatDocumentTimestamps(
        locations.find(l => l.id === stop.location_id) || {}
      )
      console.log('Found completed stop:', stop)
      rescue.stops.push(stop)
    }
    rescue.handler = formatDocumentTimestamps(
      users.find(u => u.id === rescue.handler_id) || {}
    )
  }

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
