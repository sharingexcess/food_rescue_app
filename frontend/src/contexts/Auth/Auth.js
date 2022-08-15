import React, { createContext, useEffect, useState } from 'react'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import Logo from 'assets/logo.svg'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useNavigate } from 'react-router-dom'
import { getCollection } from 'helpers'
import { getAuthenticatedUser, updatePublicUserProfile } from './utils'
import { Landing, Onboarding } from 'components'
import { Loading } from 'chakra_components/Loading/Loading'

// We create a Context to allow Auth state to be accessed from any component in the tree
// without passing the data directly as a prop
// Read more about Contexts in React: https://reactjs.org/docs/context.html
const AuthContext = createContext()
AuthContext.displayName = 'Auth'

function Auth({ children }) {
  const navigate = useNavigate()
  // we use an imported React Hook create state variables
  // user defines the current auth state,
  // loading defines whether a request is currently running
  // error defines whether we received a bad response from firebase
  const [user, loading, error] = useAuthState(firebase.auth())
  // profile looks up the user in the firestore db
  // to get additional permissions and profile data
  const [publicProfile, setPublicProfile] = useState()
  const [privateProfile, setPrivateProfile] = useState()

  useEffect(() => {
    const uid = user ? user.uid : localStorage.getItem('se_user_id')
    let publicProfileUnsubscribe
    let privateProfileUnsubscribe
    if (uid) {
      const publicProfileRef = getCollection('public_profiles').doc(uid)
      const privateProfileRef = getCollection('private_profiles').doc(uid)
      publicProfileUnsubscribe = publicProfileRef.onSnapshot(doc =>
        setPublicProfile(doc.data())
      )
      privateProfileUnsubscribe = privateProfileRef.onSnapshot(doc =>
        setPrivateProfile(doc.data())
      )
      user && localStorage.setItem('se_user_id', user.uid)
    }
    return () => {
      publicProfileUnsubscribe && publicProfileUnsubscribe()
      privateProfileUnsubscribe && privateProfileUnsubscribe()
    }
  }, [user])

  function handleLogout() {
    localStorage.removeItem('se_user_id')
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
    const permission = publicProfile?.permission
    return (
      <AuthContext.Provider
        value={{
          user: user ? { ...user, ...publicProfile, ...privateProfile } : null,
          // admin: profile && profile.is_admin,
          // driver: profile && profile.is_driver && !profile.is_admin,
          // permission: profile && (profile.is_admin || profile.is_driver),
          hasAdminPermission: publicProfile?.permission === 'admin',
          hasStandardPermissions: publicProfile?.permission === 'standard',
          hasPermission: publicProfile?.permission,
          hasCompletedPrivateProfile: privateProfile,
          handleLogout,
          handleLogin,
        }}
      >
        {permission ? children : <Onboarding />}
      </AuthContext.Provider>
    )
  }

  if (user && publicProfile) {
    return <AuthWrapper>{children}</AuthWrapper>
  } else if (error) {
    return <Error />
  } else if (loading || (user && !publicProfile)) {
    return <Loading text="Signing In" />
  } else return <Landing handleLogin={handleLogin} />
}

export { Auth, AuthContext }
