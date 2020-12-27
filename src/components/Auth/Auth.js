import React, { createContext, useContext, useEffect, useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import Loading from '../Loading/Loading'
import Logo from '../../assets/logo.svg'
import Google from '../../assets/google.svg'
import { useAuthState } from 'react-firebase-hooks/auth'
import {
  getAuthenticatedUser,
  updatePublicUserProfile,
  updateUserAdminPermissions,
} from './utils'
import './Auth.scss'

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

  useEffect(() => {
    // check and update the user's admin permission
    if (user) updateUserAdminPermissions(user, setAdmin)
  }, [user])

  async function handleLogin() {
    const user = await getAuthenticatedUser()
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
        <img className="background" src={Logo} alt="Sharing Excess Logo" />
        <button onClick={handleLogin}>
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
        <button onClick={window.location.reload()}>try again</button>
      </main>
    )
  }

  return loading ? (
    <Loading text="Signing in" />
  ) : error ? (
    <Error />
  ) : user ? (
    <AuthContext.Provider value={{ user, admin, handleLogout }}>
      {/* 
        All children will now be able to access user, admin, and handleLogout by calling:
        const { user, admin, handleLogout } = useContext(AuthContext) or using the useAuthContext() function below
      */}
      {children}
    </AuthContext.Provider>
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
