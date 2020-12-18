import firebase from 'firebase/app'
import 'firebase/auth'

const authHandler = storeAPI => next => action => {
  console.log(action.type)
  switch (action.type) {
    case 'auth/login':
      handleLogin(storeAPI, next, action)
      break
    case 'auth/logout':
      handleLogout(storeAPI, next, action)
      break
    default:
      return next(action)
  }
}

async function handleLogin(storeAPI, next, action) {
  const provider = new firebase.auth.GoogleAuthProvider()
  const { user } = await firebase.auth().signInWithPopup(provider)
  return next({ ...action, payload: user })
}

async function handleLogout(storeAPI, next, action) {
  const auth = firebase.auth()
  auth.signOut()
  return next(action)
}

export default authHandler
