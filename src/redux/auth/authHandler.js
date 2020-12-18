import firebase from 'firebase/app'
import 'firebase/auth'

// This file is REDUX MIDDLEWARE. We use middleware to run async logic like login and logout.
// It's important to do this *outside* of the actual reducer logic,
// so that the reducers are always pure functions (no side effects).
// Read more about redux middleware:
// https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-middleware-to-enable-async-logic

// authHandler is a wrapper function, around a wrapper function, around a wrapper function.
// This seems super scary => it's not. Think of it as a function with 3 arguments.

// storeAPI: this is literally just the redux store object, plain and simple.
// next: this is the function call to the actual reducer itself.
// action: this is what was passed into the dispatch function call.
//         it'll have a 'type' field denoting which reducer to run,
//         and a 'payload' field with the actual data it wants to pass.

// We'll commonly call next(action) at the end of a handler function to pass the action on to the reducer.
const authHandler = storeAPI => next => action => {
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

// handle logging a user in with google oauth.
// perform the login using firebase methods,
// grab the user object we got as a response,
// and set the action:payload to that user object.
// this will store the user data in redux to be accessed by react components.
async function handleLogin(storeAPI, next, action) {
  const provider = new firebase.auth.GoogleAuthProvider()
  const { user } = await firebase.auth().signInWithPopup(provider)
  return next({ ...action, payload: user })
}

// handle logging out an authenticated user.
// perform logout using firebase methods
// call reducer with next(action) to clear out auth state
// redirect to root url
async function handleLogout(storeAPI, next, action) {
  const auth = firebase.auth()
  const res = await auth.signOut()
  window.history.pushState({}, null, '/') // redirect to root url
  return next(action)
}

export default authHandler
