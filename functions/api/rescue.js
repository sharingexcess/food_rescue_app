const { db } = require('../helpers')
const moment = require('moment-timezone')

exports.rescue = async (request, response) => {
  return new Promise(async resolve => {
    try {
      console.log('running getRescue')

      const { id } = request.params
      console.log('Received id:', id)

      if (!id) {
        response.status(400).send('No id param received in request URL.')
        return
      }

      // load base rescue object from DB
      const rescue = await db
        .collection('rescues')
        .doc(id)
        .get()
        .then(doc => parseRescue(doc.data()))

      if (!rescue) {
        response.status(200).send(null)
      }

      console.log('Got Rescue:', rescue)

      // initialize stops array with length of stop_ids
      rescue.stops = new Array(rescue.stop_ids.length)

      const rescue_promises = [
        // populate stops array with data from stops db collection
        ...rescue.stop_ids.map((stop_id, index) =>
          db
            .collection('stops')
            .doc(stop_id)
            .get()
            .then(doc => {
              const payload = doc.data()
              rescue.stops[index] = parseStop(payload)
            })
        ),
      ]
      if (rescue.handler_id) {
        // populate rescue with handler data
        rescue_promises.push(
          db
            .collection('users')
            .doc(rescue.handler_id)
            .get()
            .then(doc => {
              const payload = doc.data()
              rescue.handler = parseHandler(payload)
              delete rescue.handler_id
            })
        )
      }
      await Promise.all(rescue_promises)

      // populate organization and location for each stop
      const metadata_promises = [
        // create a db request for each organization_id
        ...rescue.stops.map((stop, index) =>
          db
            .collection('organizations')
            .doc(stop.organization_id)
            .get()
            .then(doc => {
              const payload = doc.data()
              rescue.stops[index].organization = parseOrganization(payload)
              delete rescue.stops[index].organization_id
            })
        ),
        // create a db request for each location_id
        ...rescue.stops.map((stop, index) =>
          db
            .collection('locations')
            .doc(stop.location_id)
            .get()
            .then(doc => {
              const payload = doc.data()
              rescue.stops[index].location = parseLocation(payload)
              delete rescue.stops[index].location_id
            })
        ),
      ]
      await Promise.all(metadata_promises)

      // clean data
      delete rescue.stop_ids
      for (const stop of rescue.stops) {
        delete stop.location_id
        delete stop.organization_id
      }

      console.log('returning rescue:', rescue)
      response.status(200).send(JSON.stringify(rescue))
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
