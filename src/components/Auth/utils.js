import firebase from 'firebase/app'
import 'firebase/auth'
import { getCollection } from '../../helpers/helpers'

export async function getAuthenticatedUser() {
  const provider = new firebase.auth.GoogleAuthProvider()
  const { user } = await firebase.auth().signInWithPopup(provider)
  return user
}

export async function updatePublicUserProfile(user) {
  // fetch existing data matching this user id
  const existing_user_ref = await getCollection('Users').doc(user.uid).get()
  const existing_user = existing_user_ref.data() || {}
  // update Users Collection with this new login info
  const update_payload = {
    id: user.uid,
    email: user.email,
    name: existing_user.displayName || user.displayName,
    icon: existing_user.icon || user.photoURL,
    created_at:
      existing_user.created_at ||
      firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  }
  getCollection('Users')
    .doc(user.uid)
    .set(update_payload, { merge: true })
    .catch(e => console.error(e))
}

export function updateUserAdminPermissions(user, callback) {
  user.getIdTokenResult().then(token => {
    if (token && token.claims) {
      callback(token.claims.admin)
    }
  })
}
