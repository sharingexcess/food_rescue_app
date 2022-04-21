import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import { customAlphabet } from 'nanoid'
import { FIREBASE_CONFIG } from './constants'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwqyz', 12)

// This function call connects us to Firebase and initializes all of our API access
firebase.initializeApp(FIREBASE_CONFIG)

export const firestore = firebase.firestore()

export function generateId() {
  return nanoid()
}

export async function generateUniqueId(collection) {
  const id = nanoid()
  const exists = await isExistingId(id, collection)
  return exists ? await generateUniqueId(collection) : id
}

export function getCollection(name) {
  return firestore.collection(name)
}

export async function isExistingId(id, collection) {
  const snapshot = await firestore.collection(collection).doc(id).get()
  return snapshot.exists
}

export function getFirestoreRef(identifier) {
  // create a copy of the identifier first, as to not change the original object
  const array = [...identifier]
  let next = 'doc'
  let ref = getCollection(array.shift())
  while (array.length) {
    if (next === 'doc') {
      ref = ref.doc(array.shift())
      next = 'collection'
    } else {
      ref = ref.collection(array.shift())
      next = 'doc'
    }
  }
  return ref
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

export function initFirestoreListener(query, callback) {
  query.onSnapshot(res => {
    const payload = res.docs.map(doc => doc.data())
    callback(payload)
  })
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

export async function deleteFirestoreData(identifier) {
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
  return await query.delete()
}
