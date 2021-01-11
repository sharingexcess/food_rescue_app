import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/firestore'

// takes a path to an image in firebase storage and returns the full fetch-able url
export async function getImageFromStorage(path) {
  const ref = firebase.storage().ref()
  return await ref.child(path).getDownloadURL()
}

// takes a phone number as a string, removes all formatting and returns in format (***) ***-****
export function formatPhoneNumber(phoneNumberString) {
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3]
  }
  return null
}

// returns true if a string is a valid URL and false if not
export function isValidURL(str) {
  let url
  try {
    url = new URL(str)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

export function getCollection(name) {
  return firebase.firestore().collection(name)
}

export async function getFirestoreData(identifier) {
  let next = 'doc'
  let query = getCollection(identifier.shift())
  while (identifier.length) {
    if (next === 'doc') {
      query = query.doc(identifier.shift())
      next = 'collection'
    } else {
      query = query.collection(identifier.shift())
      next = 'doc'
    }
  }
  return await query
    .get()
    .then(res =>
      res.data ? res.data() : res.docs ? res.docs.map(doc => doc.data()) : res
    )
}

export async function setFirestoreData(identifier, value) {
  let next = 'doc'
  let query = getCollection(identifier.shift())
  while (identifier.length) {
    if (next === 'doc') {
      query = query.doc(identifier.shift())
      next = 'collection'
    } else {
      query = query.collection(identifier.shift())
      next = 'doc'
    }
  }
  return await query.set(value, { merge: true })
}
