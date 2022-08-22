import { createContext, useEffect, useState } from 'react'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useNavigate } from 'react-router-dom'
import { firestore } from 'helpers'
import { getAuthenticatedUser } from './utils'
import { Onboarding, Page, Loading, Landing } from 'components'

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
  const [user, error] = useAuthState(firebase.auth())
  // profile looks up the user in the firestore db
  // to get additional permissions and profile data
  const [publicProfile, setPublicProfile] = useState()
  const [privateProfile, setPrivateProfile] = useState()

  useEffect(() => {
    const uid = user ? user.uid : localStorage.getItem('se_user_id')
    let publicProfileUnsubscribe
    let privateProfileUnsubscribe
    if (uid) {
      const publicProfileRef = firestore.collection('public_profiles').doc(uid)
      const privateProfileRef = firestore
        .collection('private_profiles')
        .doc(uid)
      publicProfileUnsubscribe = publicProfileRef.onSnapshot(doc => {
        const data = doc.data() || null
        setPublicProfile(data)
      })
      privateProfileUnsubscribe = privateProfileRef.onSnapshot(doc => {
        const data = doc.data() || null
        setPrivateProfile(data)
      })
      user && localStorage.setItem('se_user_id', user.uid)
    } else {
      setPublicProfile(null)
      setPrivateProfile(null)
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
    await getAuthenticatedUser()
    navigate('/')
  }

  function Error() {
    return (
      <main id="Auth">
        <h1>
          <span className="green">Sharing</span> Excess
        </h1>
        <p>Looks like there was an error logging in.</p>
        <img className="background" src="/logo.png" alt="Sharing Excess Logo" />
        <button onClick={() => window.location.reload()}>try again</button>
      </main>
    )
  }

  function AuthWrapper({ children }) {
    return (
      <AuthContext.Provider
        value={{
          user: user ? { ...user, ...publicProfile, ...privateProfile } : null,
          hasAdminPermission: publicProfile?.permission === 'admin',
          hasStandardPermissions: publicProfile?.permission === 'standard',
          hasPermission: publicProfile?.permission,
          hasCompletedPrivateProfile: privateProfile,
          handleLogout,
          handleLogin,
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  }

  if (publicProfile === undefined) {
    // Case 1: the user has signed in,
    // and the query to check for a public profile
    // has not yet returned.
    // Render a loading screen until the query returns.
    return (
      <AuthWrapper>
        <Loading text="Signing In" />
      </AuthWrapper>
    )
  } else if (user && publicProfile === null) {
    // Case 2: this is a brand new user.
    // They have signed in, and the public profile
    // query returned 'undefined', meaning they
    // do not have a public profile yet.
    // Render the onboarding component,
    // with access to the user object.
    return (
      <AuthWrapper>
        <Page defaultTitle="Onboarding" id="Onboarding" Content={Onboarding} />
      </AuthWrapper>
    )
  } else if (user && publicProfile) {
    // Case 3: the user has signed in,
    // and has completed their public profile.
    // We can now render the app normally. Woo!
    return <AuthWrapper>{children}</AuthWrapper>
  } else if (error) {
    // Case 4: there was an error in the auth process,
    // Render an error screen.
    return <Error />
  } else {
    // Case 5: if there is no signed in user,
    // render the landing page with sign in action.
    return (
      <AuthWrapper>
        <Page defaultTitle="Welcome" id="Landing" Content={Landing} />
      </AuthWrapper>
    )
  }
}

export { Auth, AuthContext }
