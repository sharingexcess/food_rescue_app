import React, { createContext, useContext, useEffect, useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import Loading from '../Loading/Loading'
import Logo from '../../assets/logo.svg'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useLocation } from 'react-router-dom'
import Landing from '../Landing/Landing'
import Login from '../Login/Login'
import Onboarding from '../Onboarding/Onboarding'
import { getFirestoreData } from '../../helpers/helpers'
import './Auth.scss'

// We create a Context to allow Auth state to be accessed from any component in the tree
// without passing the data directly as a prop
// Read more about Contexts in React: https://reactjs.org/docs/context.html
const AuthContext = createContext()
AuthContext.displayName = 'Auth'

function Auth({ children }) {
  // we use an imported React Hook create state variables
  // auth_user defines the current auth state,
  // loading defines whether a request is currently running
  // error defines whether we received a bad response from firebase
  const [auth_user, loading, error] = useAuthState(firebase.auth())
  // db_user looks up the auth_user in the firestore db
  // to get additional permissions and profile data
  const [db_user, setDbUser] = useState()

  useEffect(() => {
    if (auth_user) {
      getFirestoreData(['Users', auth_user.uid]).then(user_record =>
        setDbUser(user_record)
      )
    }
  }, [auth_user])

  const location = useLocation()

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

  return loading || (auth_user && !db_user) ? (
    <Loading text="Signing in" />
  ) : error ? (
    <Error />
  ) : auth_user ? (
    !(db_user.access_level === 'driver' || db_user.access_level === 'admin') ? (
      <Onboarding handleClick={handleLogout} userName={auth_user.displayName} />
    ) : (
      <AuthContext.Provider
        value={{
          user: auth_user ? { ...auth_user, ...db_user } : null,
          admin: db_user.access_level === 'admin',
          driver: db_user.access_level === 'driver',
          handleLogout,
        }}
      >
        {/* 
        All children will now be able to access user, admin, and handleLogout by calling:
        const { user, admin, handleLogout } = useContext(AuthContext) or using the useAuth() function below
      */}
        {children}
      </AuthContext.Provider>
    )
  ) : (
    <AuthContext.Provider
      value={{
        user: auth_user ? { ...auth_user, ...db_user } : null,
        admin: db_user && db_user.access_level === 'admin',
        driver: db_user && db_user.access_level === 'driver',
        handleLogout,
      }}
    >
      {location.pathname === '/login' ? <Login /> : <Landing />}
    </AuthContext.Provider>
  )
}

// useAuth let's child component access the AuthContext more simply and cleanly
// and ensures that we can set safe defaults
const useAuth = () =>
  useContext(AuthContext) || {
    user: null,
    admin: false,
    handleLogout: () => null,
  }

export { Auth as default, useAuth }
