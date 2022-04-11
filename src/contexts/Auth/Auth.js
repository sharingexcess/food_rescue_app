import React, { createContext, useEffect, useState } from 'react'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import Logo from 'assets/logo.svg'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useNavigate } from 'react-router-dom'
import { createTimestamp, getCollection } from 'helpers'
import { getAuthenticatedUser, updatePublicUserProfile } from './utils'
import { Loading } from 'components'

// We create a Context to allow Auth state to be accessed from any component in the tree
// without passing the data directly as a prop
// Read more about Contexts in React: https://reactjs.org/docs/context.html
const AuthContext = createContext()
AuthContext.displayName = 'Auth'

function Auth({ children }) {
  const navigate = useNavigate()
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
      const userRef = getCollection('users').doc(auth_user.uid)
      userRef
        .update({ timestamp_last_active: createTimestamp() })
        .then(() => userRef.onSnapshot(doc => setDbUser(doc.data())))
    }
  }, [auth_user])

  function handleLogout() {
    firebase.auth().signOut()
    navigate('/')
  }

  async function handleLogin() {
    const user = await getAuthenticatedUser()
    updatePublicUserProfile(user)
    navigate('/')
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
  function AuthWrapper({ children }) {
    return (
      <AuthContext.Provider
        value={{
          user: auth_user ? { ...auth_user, ...db_user } : null,
          admin: db_user && db_user.is_admin,
          driver: db_user && db_user.is_driver && !db_user.is_admin,
          permission: db_user && (db_user.is_admin || db_user.is_driver),
          handleLogout,
          handleLogin,
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  }

  return loading || (auth_user && !db_user) ? (
    <Loading text="Signing in" />
  ) : error ? (
    <Error />
  ) : (
    <AuthWrapper>{children}</AuthWrapper>
  )
}

export { Auth, AuthContext }
