import firebase from 'firebase/app'
import 'firebase/auth'
import {
  getFirestoreData,
  setFirestoreData,
  createServerTimestamp,
} from 'helpers'

export async function getAuthenticatedUser() {
  const provider = new firebase.auth.GoogleAuthProvider()
  const { user } = await firebase.auth().signInWithPopup(provider)
  return user
}

export async function updatePublicUserProfile(user) {
  // fetch existing data matching this user id
  const existing_user = await getFirestoreData(['Users', user.id])
  // update Users Collection with this new login info
  if (!existing_user) {
    setFirestoreData(['Users', user.uid], {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      icon: user.photoURL,
      access_level: 'none',
      created_at: createServerTimestamp(),
    })
  }
  setFirestoreData(['Users', user.uid], {
    last_login: createServerTimestamp(),
  })
}
