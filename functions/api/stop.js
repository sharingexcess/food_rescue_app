const { db } = require('../helpers')
const moment = require('moment-timezone')

exports.stop = async (request, response) => {
  return new Promise(async resolve => {
    try {
      console.log('running stop')

      const { stop_id } = request.params
      console.log('Received id:', stop_id)

      if (!stop_id) {
        response.status(400).send('No stop_id param received in request URL.')
        return
      }

      // load base rescue object from DB
      const stop = await db
        .collection('stops')
        .doc(stop_id)
        .get()
        .then(doc => parseStop(doc.data()))

      if (!stop) {
        response.status(200).send(null)
      }

      console.log('Got Stop:', stop)

      // populate organization and location for each stop
      const metadata_promises = [
        db
          .collection('organizations')
          .doc(stop.organization_id)
          .get()
          .then(doc => {
            const payload = doc.data()
            stop.organization = parseOrganization(payload)
            delete stop.organization_id
          }),
        db
          .collection('locations')
          .doc(stop.location_id)
          .get()
          .then(doc => {
            const payload = doc.data()
            stop.location = parseLocation(payload)
            delete stop.location_id
          }),
      ]
      await Promise.all(metadata_promises)

      console.log('returning stop:', stop)
      response.status(200).send(JSON.stringify(stop))

      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

function parseStop(stop) {
  const payload = {
    id: stop.id,
    status: stop.status,
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
    impact_data_dairy: stop.impact_data_dairy,
    impact_data_bakery: stop.impact_data_bakery,
    impact_data_produce: stop.impact_data_produce,
    impact_data_meat_fish: stop.impact_data_meat_fish,
    impact_data_non_perishable: stop.impact_data_non_perishable,
    impact_data_prepared_frozen: stop.impact_data_prepared_frozen,
    impact_data_mixed: stop.impact_data_mixed,
    impact_data_other: stop.impact_data_other,
    impact_data_total_weight: stop.impact_data_total_weight,
  }
  if (stop.percent_of_total_dropped) {
    payload.percent_of_total_dropped = stop.percent_of_total_dropped
  }
  return payload
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
