import React, { createContext, useContext, useEffect, useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import Loading from '../Loading/Loading'
import Logo from '../../assets/logo.svg'
import Google from '../../assets/google.svg'
import { useAuthState } from 'react-firebase-hooks/auth'
import { updatePublicUserProfile, updateUserPermissions } from './utils'
import './Auth.scss'

const GoogleApi = window.gapi
const CLIENT_ID = process.env.REACT_APP_FIREBASE_OAUTH_CLIENT_ID
const API_KEY = process.env.REACT_APP_FIREBASE_API_KEY
const SCOPES = 'https://www.googleapis.com/auth/calendar.events'
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
]

// We create a Context to allow Auth state to be accessed from any component in the tree
// without passing the data directly as a prop
// Read more about Contexts in React: https://reactjs.org/docs/context.html
const AuthContext = createContext()
AuthContext.displayName = 'Auth'

function Auth({ children }) {
  // use an imported React Hook create state variables
  // user defines the current auth state,
  // loading defines whether a request is currently running
  // error defines whether we received a bad response from firebase
  const [user, loading, error] = useAuthState(firebase.auth())
  // we create our own state variable to define whether the current user is an admin
  // the default is 'false' so as not to give any accidental permissions
  const [admin, setAdmin] = useState(false)
  const [basicAccess, setBasicAccess] = useState(false)

  useEffect(initGoogleApi, [])

  useEffect(() => {
    // check and update the user's admin permission
    if (user)
      updateUserPermissions(user, permissions => {
        setAdmin(permissions.admin)
        setBasicAccess(permissions.basicAccess)
      })
  }, [user])

  function initGoogleApi() {
    GoogleApi.load('client:auth2', () => {
      GoogleApi.client.load('calendar', 'v3', () => {
        GoogleApi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
      })
    })
  }

  async function handleLogin() {
    const googleAuth = GoogleApi.auth2.getAuthInstance()
    const googleUser = await googleAuth.signIn()
    const token = googleUser.getAuthResponse().id_token
    const credential = firebase.auth.GoogleAuthProvider.credential(token)
    const { user } = await firebase.auth().signInWithCredential(credential)
    updatePublicUserProfile(user)
  }

  function handleLogout() {
    firebase.auth().signOut()
  }

  function Login() {
    return (
      <main id="Login">
        <h1>
          <span className="green">Sharing</span> Excess
        </h1>
        <p>Let's free food!</p>
        <img className="background" src={Logo} alt="Sharing Excess Logo" />
        <button className="google" onClick={handleLogin}>
          <img src={Google} alt="Google Logo" />
          Sign in with Google
        </button>
      </main>
    )
  }

  function Error() {
    return (
      <main id="Login">
        <h1>
          <span className="green">Sharing</span> Excess
        </h1>
        <p>Looks like there was an error logging in.</p>
        <img className="background" src={Logo} alt="Sharing Excess Logo" />
        <button onClick={() => window.location.reload()}>try again</button>
      </main>
    )
  }

  function RequestAccess() {
    return (
      <main id="Login" className="request-access">
        <h1>
          <span className="green">Sharing</span> Excess
        </h1>
        <p>Hi, {user.displayName}!</p>
        <div>
          You've logged in successfully with Google. Before you gain access to
          rescue data, you'll need to be given permission by an admin.
          <br />
          <br />
          Updating your permissions requires logging out and back in again. Once
          you've been granted permissions, log back in to gain access!
        </div>
        <br />
        <img className="background" src={Logo} alt="Sharing Excess Logo" />
        <button onClick={handleLogout}>
          <i className="fas fa-sign-out-alt" />
          logout
        </button>
      </main>
    )
  }

  // return <Calendar />
  return loading ? (
    <Loading text="Signing in" />
  ) : error ? (
    <Error />
  ) : user ? (
    !(basicAccess || admin) ? (
      <RequestAccess />
    ) : (
      <AuthContext.Provider value={{ user, admin, handleLogout }}>
        {/* 
        All children will now be able to access user, admin, and handleLogout by calling:
        const { user, admin, handleLogout } = useContext(AuthContext) or using the useAuthContext() function below
      */}
        {children}
      </AuthContext.Provider>
    )
  ) : (
    <Login />
  )
}

// useAuth let's child component access the AuthContext more simply and cleanly
// and ensures that we can set safe defaults
const useAuthContext = () =>
  useContext(AuthContext) || {
    user: null,
    admin: false,
    handleLogout: () => null,
  }

export { Auth as default, useAuthContext }
