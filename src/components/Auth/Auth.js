import React, { createContext, useContext, useEffect, useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import Loading from '../Loading/Loading'
import Logo from '../../assets/logo.svg'
import { useAuthState } from 'react-firebase-hooks/auth'
import { updateUserPermissions } from './utils'
import { useLocation } from 'react-router-dom'
import Landing from '../Landing/Landing'
import Login from '../Login/Login'
import Onboarding from '../Onboarding/Onboarding'
import './Auth.scss'

// We create a Context to allow Auth state to be accessed from any component in the tree
// without passing the data directly as a prop
// Read more about Contexts in React: https://reactjs.org/docs/context.html
const AuthContext = createContext()
AuthContext.displayName = 'Auth'

function Auth({ children }) {
  const location = useLocation()
  // use an imported React Hook create state variables
  // user defines the current auth state,
  // loading defines whether a request is currently running
  // error defines whether we received a bad response from firebase
  const [user, loading, error] = useAuthState(firebase.auth())
  // we create our own state variable to define whether the current user is an admin
  // the default is 'false' so as not to give any accidental permissions
  const [admin, setAdmin] = useState(false)
  const [basicAccess, setBasicAccess] = useState(false)

  useEffect(() => {
    // check and update the user's admin permission
    if (user)
      updateUserPermissions(user, permissions => {
        setAdmin(permissions.admin)
        setBasicAccess(permissions.basicAccess)
      })
  }, [user])

  function handleLogout() {
    firebase.auth().signOut()
  }

  function Error() {
    return (
      <main id="Auth">
        <h1>
          <span className="green">Sharing</span> Excess
        </h1>
        <p>Looks like there was an error logging in.</p>
        <img className="background" src={Logo} alt="Sharing Excess Logo" />
        <button onClick={() => window.location.reload()}>try again</button>
      </main>
    )
  }

  return loading ? (
    <Loading text="Signing in" />
  ) : error ? (
    <Error />
  ) : user ? (
    !(basicAccess || admin) ? (
      <Onboarding handleClick={handleLogout} userName={user.displayName} />
    ) : (
      // <RequestAccess />
      <AuthContext.Provider value={{ user, admin, handleLogout }}>
        {/* 
        All children will now be able to access user, admin, and handleLogout by calling:
        const { user, admin, handleLogout } = useContext(AuthContext) or using the useAuthContext() function below
      */}
        {children}
      </AuthContext.Provider>
    )
  ) : (
    <AuthContext.Provider value={{ user, admin, handleLogout }}>
      {location.pathname === '/login' ? <Login /> : <Landing />}
    </AuthContext.Provider>
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
