import firebase from 'firebase/app'
import 'firebase/auth'
import { getCollection, setFirestoreData } from '../../helpers/helpers'

export async function getAuthenticatedUser() {
  const provider = new firebase.auth.GoogleAuthProvider()
  const { user } = await firebase.auth().signInWithPopup(provider)
  return user
}

export async function updatePublicUserProfile(user) {
  // fetch existing data matching this user id
  const existing_user = await getCollection('Users')
    .doc(user.uid)
    .get()
    .then(res => res.data())
  // update Users Collection with this new login info
  const update_payload = {
    id: user.uid,
    email: user.email,
    name: existing_user !== undefined ? existing_user.name : user.displayName,
    icon: existing_user !== undefined ? existing_user.icon : user.photoURL,
    created_at:
      existing_user !== undefined
        ? existing_user.created_at
        : firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  }
  setFirestoreData(['Users', user.uid], update_payload)
}
