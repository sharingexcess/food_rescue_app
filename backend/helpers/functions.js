const admin = require('firebase-admin')
exports.app = admin.initializeApp()
exports.db = admin.firestore()
const moment = require('moment-timezone')

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
