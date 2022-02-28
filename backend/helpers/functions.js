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
  delete copy.timestamp_created
  delete copy.timestamp_updated
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
