const admin = require('firebase-admin')
exports.app = admin.initializeApp()
exports.db = admin.firestore()
const moment = require('moment-timezone')

exports.recalculateRescue = async id => {
  let rescue
  const stops = []

  // run these two queries in parallel
  await Promise.all([
    this.db
      .collection('rescues')
      .doc(id)
      .get()
      .then(doc => (rescue = doc.data())),
    this.db
      .collection('stops')
      .where('rescue_id', '==', id)
      .get()
      .then(snapshot => snapshot.forEach(doc => stops.push(doc.data()))),
  ])
  // do this mapping to get stops in correct order
  rescue.stops = rescue.stop_ids.map(id => stops.find(s => s.id === id))

  const current_load = {
    impact_data_dairy: 0,
    impact_data_bakery: 0,
    impact_data_produce: 0,
    impact_data_meat_fish: 0,
    impact_data_non_perishable: 0,
    impact_data_prepared_frozen: 0,
    impact_data_mixed: 0,
    impact_data_other: 0,
  }

  // we'll queue up queries, and add them into this array
  // so they can run in parallel, and we can await the whole
  // list at the end, instead of running them all serially
  const promises = []

  for (const stop of rescue.stops) {
    console.log('\n\nCURRENT LOAD:', current_load)
    if (stop.type === 'pickup') {
      for (const category in current_load) {
        current_load[category] += stop[category]
      }
    } else {
      if (stop.status === 'completed') {
        const impact_data = {}
        const percent_dropped = stop.percent_of_total_dropped / 100
        const load_weight = Object.values(current_load).reduce(
          (a, b) => a + b,
          0
        )
        for (const category in current_load) {
          console.log(
            'adding',
            Math.round(current_load[category] * percent_dropped),
            'to',
            category
          )
          impact_data[category] = Math.round(
            current_load[category] * percent_dropped
          )
          current_load[category] -= impact_data[category]
        }
        impact_data.impact_data_total_weight = Math.round(
          load_weight * percent_dropped
        )
        const payload = {
          ...impact_data,
          timestamp_updated: new Date(),
        }
        promises.push(
          this.db.collection('stops').doc(stop.id).set(payload, { merge: true })
        )
      } else if (stop.status === 'cancelled') {
        const payload = {
          impact_data_total_weight: 0,
          timestamp_updated: new Date(),
        }
        for (const key in current_load) {
          payload[key] = 0
        }
        if (stop.type === 'delivery') {
          payload.percent_of_total_dropped = 0
        }
        promises.push(
          this.db.collection('stops').doc(stop.id).set(payload, { merge: true })
        )
      }
    }
  }
  await Promise.all(promises)
  console.log('updated all stops in rescue')
}

exports.fetchCollection = async name => {
  const results = []
  await admin
    .firestore()
    .collection(name)
    .get()
    .then(snapshot => snapshot.forEach(doc => results.push(doc.data())))
  return results
}

exports.uploadFile = async (path, data) => {
  const bucket = admin.storage().bucket()
  try {
    await bucket.file(path).save(data)
    console.log(`Successfully uploaded ${path} to Storage`)
  } catch (error) {
    console.error(`Error uploading file ${path} to storage:`, error)
  }
}

exports.formatDocumentTimestamps = data => {
  const copy = { ...data }
  for (const key in copy) {
    if (key.includes('timestamp_')) {
      copy[key] = exports.formatTimestamp(copy[key])
    }
  }
  return copy
}

exports.formatTimestamp = timestamp => {
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

exports.rejectUnauthorizedRequest = response => {
  response
    .status(403)
    .send('User does not have permission to make this request.')
}

exports.calculateTotalDistanceFromLocations = async (locations = []) => {
  console.log(
    'Running calculateTotalDistanceFromLocations with input:',
    locations
  )
  const base_url =
    'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial'
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY

  let total_distance = 0
  let curr_location = locations.shift()

  while (locations.length) {
    const full_url = `
      ${base_url}&key=${API_KEY}
      &origins=${encodeURIComponent(curr_location)}
      &destinations=${encodeURIComponent(locations[0])}
    `

    const response = await fetch(full_url).then(res => res.json())
    const distance = parseFloat(
      response.rows[0].elements[0].distance.text.split(' ')[0]
    )

    console.log(distance)
    total_distance += distance
    curr_location = locations.shift()
  }

  console.log(total_distance, 'miles')
  return `${total_distance} miles`
}

exports.fetchDocument = async (collection, id) => {
  let doc
  await db
    .collection(collection)
    .where('id', '==', id)
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(result => (doc = result))
    })
  return doc
}

exports.formatLocationAsAddressString = location => {
  return `${location.address1}${
    location.address2 ? ' ' + location.address2 : ''
  }, ${location.city}, ${location.state}, ${location.zip}`
}
