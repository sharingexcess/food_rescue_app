const admin = require('firebase-admin')
const moment = require('moment-timezone')
const fetch = require('node-fetch')
const { customAlphabet } = require('nanoid')
const {
  FOOD_CATEGORIES,
  COLLECTIONS,
  TRANSFER_TYPES,
  STATUSES,
  EMPTY_CATEGORIZED_WEIGHT,
} = require('./constants')
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwqyz', 12)

exports.app = admin.initializeApp()
exports.db = admin.firestore()

exports.recalculateRescue = async id => {
  let rescue
  const transfers = []

  // run these two queries in parallel
  await Promise.all([
    this.db
      .collection(COLLECTIONS.RESCUES)
      .doc(id)
      .get()
      .then(doc => (rescue = doc.data())),
    this.db
      .collection(COLLECTIONS.TRANSFERS)
      .where('rescue_id', '==', id)
      .get()
      .then(snapshot => snapshot.forEach(doc => transfers.push(doc.data()))),
  ])
  // do this mapping to get transfers in correct order
  rescue.transfers = rescue.transfer_ids.map(id =>
    transfers.find(s => s.id === id)
  )

  const current_load = EMPTY_CATEGORIZED_WEIGHT()

  // we'll queue up queries, and add them into this array
  // so they can run in parallel, and we can await the whole
  // list at the end, instead of running them all serially
  const promises = []

  for (const transfer of rescue.transfers) {
    console.log('\n\nCURRENT LOAD:', current_load)

    if (
      transfer.type === TRANSFER_TYPES.COLLECTION &&
      transfer.status !== STATUSES.CANCELLED
    ) {
      for (const category in current_load) {
        current_load[category] += transfer.categorized_weight[category]
      }
    } else {
      if (transfer.status === STATUSES.COMPLETED) {
        const categorized_weight = {}
        const percent_dropped = transfer.percent_of_total_dropped / 100
        const load_weight = Object.values(current_load).reduce(
          (a, b) => a + b,
          0
        )
        const total_weight = Math.round(load_weight * percent_dropped)
        for (const category in current_load) {
          console.log(
            'adding',
            Math.round(current_load[category] * percent_dropped),
            'to',
            category
          )
          categorized_weight[category] = Math.round(
            current_load[category] * percent_dropped
          )
          current_load[category] -= categorized_weight[category]
        }
        const payload = {
          categorized_weight,
          total_weight,
          timestamp_updated: moment().toISOString(),
        }
        promises.push(
          this.db
            .collection(COLLECTIONS.TRANSFERS)
            .doc(transfer.id)
            .set(payload, { merge: true })
        )
      } else if (transfer.status === STATUSES.CANCELLED) {
        const payload = {
          total_weight: 0,
          categorized_weight: EMPTY_CATEGORIZED_WEIGHT(),
          timestamp_updated: moment().toISOString(),
        }
        if (transfer.type === TRANSFER_TYPES.DISTRIBUTION) {
          payload.percent_of_total_dropped = 0
        }
        promises.push(
          this.db
            .collection(COLLECTIONS.TRANSFERS)
            .doc(transfer.id)
            .set(payload, { merge: true })
        )
      }
    }
  }
  await Promise.all(promises)
  console.log('updated all transfers in rescue')
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
  console.log('Grabbing API Key')

  const API_KEY = process.env.GOOGLE_DISTANCE_MATRIX_API

  let total_distance = 0
  let curr_location = locations.shift()

  while (locations.length) {
    console.log('Constructing URL')
    let full_url
    try {
      full_url = `
      ${base_url}&key=${API_KEY}
      &origins=${encodeURIComponent(curr_location)}
      &destinations=${encodeURIComponent(locations[0])}
    `
    } catch (error) {
      console.log('Failed to construct URL')
      console.error(error)
    }

    console.log('Fetching URL')
    let response
    try {
      response = await fetch(full_url).then(res => res.json())
    } catch (error) {
      console.log('Failed Fetch')
      console.error(error)
    }

    console.log('Fetch Result:', response)

    console.log('Grabbing distance')
    let distance
    try {
      distance = parseFloat(
        response.rows[0].elements[0].distance.text.split(' ')[0]
      )
    } catch (error) {
      console.log('Failed to grab distance')
      console.error(error)
    }

    console.log(
      'Distance between',
      curr_location,
      'and',
      locations[0],
      distance
    )
    total_distance += distance
    curr_location = locations.shift()
  }

  console.log('Total Distance:', total_distance, 'miles')
  return total_distance
}

exports.fetchDocument = async (collection, id) => {
  let doc
  await exports.db
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

exports.generateUniqueId = async collection => {
  const id = nanoid()
  const exists = await exports.isExistingId(id, collection)
  return exists ? await exports.generateUniqueId(collection) : id
}

exports.isExistingId = async (id, collection) => {
  const snapshot = await exports.db.collection(collection).doc(id).get()
  return snapshot.exists
}

exports.isValidIsoDateStringInUTC = str => {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false
  const d = new Date(str)
  return d instanceof Date && !isNaN(d) && d.toISOString() === str // valid date
}

exports.isExistingDbRecord = async (id, collection) => {
  try {
    if (!id) {
      console.log('isExistingDbRecord: No id provided. Rejecting.')
      return false
    }

    const record = await exports.db
      .collection(collection)
      .doc(id)
      .get()
      .then(doc => doc.data())

    if (!record) {
      console.log(
        `isExistingDbRecord: no record found matching in ${collection} with id: ${id}. Rejecting.`
      )
      return false
    }
    return true
  } catch (e) {
    console.error('Error in isExistingDbRecord:', e)
    return false
  }
}

exports.isValidCategorizedWeightObject = (categorized_weight, total_weight) => {
  console.log(
    'Validating categorized weight:',
    categorized_weight,
    total_weight,
    'expected total'
  )
  let is_valid = true
  let sum = 0
  for (const key of FOOD_CATEGORIES) {
    const value = categorized_weight[key]
    if (!Number.isInteger(value) || value < 0) {
      console.log(
        `isValidCategorizedWeightObject: ${key} value is invalid: ${value}. Rejecting.`
      )
      is_valid = false
      break
    } else sum += value
  }
  // we allow for a maximum rounding error of 1lb. per category, up to 8lbs. total
  if (Math.abs(sum - total_weight) > 8) {
    console.log(
      `isValidCategorizedWeightObject: categorized_weight sum (${sum}) does not equal total_weight (${total_weight}). Rejecting.`
    )
    is_valid = false
  }
  return is_valid
}

exports.isValidTransferIdList = async (transfer_ids, rescue_id) => {
  try {
    if (!rescue_id || !transfer_ids) {
      throw new Error('isValidTransferIdList: Invalid arguments provided.')
    }

    for (const transfer_id of transfer_ids) {
      const transfer = await exports.db
        .collection(COLLECTIONS.TRANSFERS)
        .doc(transfer_id)
        .get()
        .then(doc => doc.data())

      if (!transfer) {
        console.log(
          `isValidTransferIdList: no transfer found matching id: ${transfer_id}. Rejecting.`
        )
        return false
      }

      if (transfer.rescue_id !== rescue_id) {
        console.log(
          `isValidTransferIdList: transfer: ${transfer_id}
          rescue_id property does not match provided rescue.
          Provided value: ${rescue_id},
          transfer's rescue_id value: ${transfer.rescue_id}.
          Rejecting.`
        )
        return false
      }

      // first transfer must be a collection
      if (
        transfer_id === transfer_ids[0] &&
        transfer.type !== TRANSFER_TYPES.COLLECTION
      ) {
        console.log(
          `isValidTransferIdList: first transfer must be of type collection. Rejecting.`
        )
        return false
      }

      // last transfer must be a distribution
      if (
        transfer_id === transfer_ids[transfer_ids.length - 1] &&
        transfer.type !== TRANSFER_TYPES.DISTRIBUTION
      ) {
        console.log(
          `isValidTransferIdList: last transfer must be of type distribution, actual value: ${transfer.type}. Rejecting.`
        )
        return false
      }
    }
    return true
  } catch (e) {
    console.error('Error in isExistingDbRecord:', e)
    return false
  }
}
