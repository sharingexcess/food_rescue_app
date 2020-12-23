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

  async function handleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider()
    const { user } = await firebase.auth().signInWithPopup(provider)
    const existing_user_ref = await firebase
      .firestore()
      .collection('Users')
      .doc(user.uid)
      .get()
    const existing_user = existing_user_ref.data() || {}
    firebase
      .firestore()
      .collection('Users')
      .doc(user.uid)
      .set(
        {
          ...existing_user,
          id: user.uid,
          name: user.displayName,
          email: user.email,
          icon: existing_user.icon ? existing_user.icon : user.photoURL,
          created_at: existing_user.created_at
            ? existing_user.created_at
            : firebase.firestore.FieldValue.serverTimestamp(),
          last_login: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      )
      .catch(e => console.error(e))
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
