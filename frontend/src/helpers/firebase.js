import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import { customAlphabet } from 'nanoid'
import { FIREBASE_CONFIG } from './constants'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwqyz', 12)

// This function call connects us to Firebase and initializes all of our API access
firebase.initializeApp(FIREBASE_CONFIG)

export const firestore = firebase.firestore()
export const auth = firebase.auth()

export function generateId() {
  return nanoid()
}

export async function generateUniqueId(collection) {
  const id = nanoid()
  const exists = await isExistingId(id, collection)
  return exists ? await generateUniqueId(collection) : id
}

export async function isExistingId(id, collection) {
  const snapshot = await firestore.collection(collection).doc(id).get()
  return snapshot.exists
}
