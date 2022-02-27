const { db, fetchCollection } = require('../helpers')
const moment = require('moment-timezone')

exports.rescues = async (request, response) => {
  return new Promise(async resolve => {
    try {
      console.log('running rescues')

      const { date_range_start, date_range_end } = request.query
      console.log('Received date_range_start query param:', date_range_start)
      console.log('Received date_range_end query param:', date_range_end)

      const organizations = await fetchCollection('organizations')
      const locations = await fetchCollection('locations')
      const users = await fetchCollection('users')

      const rescues = []
      const stops = []

      let rescues_query = db.collection('rescues')
      let stops_query = db.collection('stops')

      // apply date range filters
      if (date_range_start) {
        rescues_query = rescues_query.where(
          'timestamp_scheduled_start',
          '>=',
          new Date(date_range_start)
        )
        stops_query = stops_query.where(
          'timestamp_scheduled_start',
          '>=',
          new Date(date_range_start)
        )
      }

      if (date_range_end) {
        rescues_query = rescues_query.where(
          'timestamp_scheduled_start',
          '<=',
          new Date(date_range_end)
        )
        stops_query = stops_query.where(
          'timestamp_scheduled_start',
          '<=',
          new Date(date_range_end)
        )
      }

      // execute db queries
      await Promise.all([
        rescues_query
          .get()
          .then(snapshot =>
            snapshot.forEach(doc => rescues.push(parseRescue(doc.data())))
          ),
        stops_query
          .get()
          .then(snapshot =>
            snapshot.forEach(doc => stops.push(parseStop(doc.data())))
          ),
      ])

      if (!rescues) {
        response.status(200).send([])
      }

      // initialize stops array with length of stop_ids
      for (const rescue of rescues) {
        rescue.stops = []
        const rescue_stops = stops.filter(i => i.rescue_id === rescue.id)
        for (const s of rescue.stop_ids) {
          const stop = parseStop(rescue_stops.find(i => i.id === s) || {})
          stop.organization = parseOrganization(
            organizations.find(o => o.id === stop.organization_id) || {}
          )
          stop.location = parseLocation(
            locations.find(l => l.id === stop.location_id) || {}
          )
          rescue.stops.push(stop)
        }
        rescue.handler = parseHandler(
          users.find(u => u.id === rescue.handler_id) || {}
        )

        // clean data
        delete rescue.stop_ids
        delete rescue.handler_id
        for (const stop of rescue.stops) {
          delete stop.location_id
          delete stop.organization_id
        }
      }

      console.log('returning rescues:', rescues)
      response.status(200).send(JSON.stringify(rescues))
      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

function parseRescue(rescue) {
  return {
    id: rescue.id,
    notes: rescue.notes,
    status: rescue.status,
    stop_ids: rescue.stop_ids,
    handler_id: rescue.handler_id,
    timestamp_scheduled_start: formatTimestamp(
      rescue.timestamp_scheduled_start
    ),
    timestamp_scheduled_finish: formatTimestamp(
      rescue.timestamp_scheduled_finish
    ),
    timestamp_logged_start: formatTimestamp(rescue.timestamp_logged_start),
    timestamp_logged_finish: formatTimestamp(rescue.timestamp_logged_finish),
  }
}

function parseStop(stop) {
  return {
    id: stop.id,
    rescue_id: stop.rescue_id,
    name: stop.name,
    type: stop.type,
    subtype: stop.subtype,
    organization_id: stop.organization_id,
    location_id: stop.location_id,
    timestamp_scheduled_start: formatTimestamp(stop.timestamp_scheduled_start),
    timestamp_scheduled_finish: formatTimestamp(
      stop.timestamp_scheduled_finish
    ),
    timestamp_logged_start: formatTimestamp(stop.timestamp_logged_start),
    timestamp_logged_finish: formatTimestamp(stop.timestamp_logged_finish),
  }
}

function parseOrganization(organization) {
  return {
    id: organization.id,
    name: organization.name,
    type: organization.type,
    subtype: organization.subtype,
  }
}

function parseLocation(location) {
  return {
    id: location.id,
    organization_id: location.organization_id,
    lat: location.lat,
    lng: location.lng,
    notes: location.notes,
    address: `${location.address1}${
      location.address2 ? ', ' + location.address2 : ''
    }, ${location.city}, ${location.state} ${location.zip}`,
    address1: location.address1,
    address2: location.address2,
    city: location.city,
    state: location.state,
    zip: location.zip,
    nickname: location.nickname,
    contact_name: location.contact_name,
    contact_email: location.contact_email,
    contact_phone: location.contact_phone,
  }
}

function parseHandler(handler) {
  return {
    id: handler.id,
    name: handler.name,
    phone: handler.phone,
    icon: handler.icon,
    email: handler.email,
  }
}

function formatTimestamp(timestamp) {
  if (timestamp) {
    if (timestamp.toDate) {
      return moment(timestamp.toDate()).tz('America/New_York').format()
    } else {
      return moment(new Date(timestamp)).tz('America/New_York').format()
    }
  } else {
    return null
  }
}
