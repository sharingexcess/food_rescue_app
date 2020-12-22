import { FIREBASE_CONFIG } from './constants'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'

export function initializeFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG)
  } else {
    firebase.app() // if already initialized, use that one
  }
}

export async function getImageFromStorage(path) {
  const ref = firebase.storage().ref()
  return await ref.child(path).getDownloadURL()
}

export function formatPhoneNumber(phoneNumberString) {
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3]
  }
  return null
}
