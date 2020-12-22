import React, { createContext, useEffect, useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import Loading from '../Loading/Loading'
import Logo from '../../assets/logo.svg'
import Google from '../../assets/google.svg'
import { useAuthState } from 'react-firebase-hooks/auth'
import './Auth.scss'

const AuthContext = createContext()
AuthContext.displayName = 'Auth'

function Auth({ children }) {
  // NOTE: adding any event listeners (including useEffect functions)
  // to these state values WILL BREAK EVERYTHING. Hate to see it :(
  const [user, loading, error] = useAuthState(firebase.auth())
  const [admin, setAdmin] = useState()

  useEffect(() => {
    user &&
      user.getIdTokenResult().then(token => {
        if (token && token.claims) {
          setAdmin(token.claims.admin)
        }
      })
  }, [user])

  function handleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithPopup(provider)
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
    <AuthContext.Provider value={{ user, admin, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  ) : (
    <Login />
  )
}

export { AuthContext }
export default Auth
