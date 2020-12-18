import { FIREBASE_CONFIG } from './constants'
import firebase from 'firebase/app'

export function initializeFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG)
  } else {
    firebase.app() // if already initialized, use that one
  }
}
