import { memo, useEffect } from 'react'
import { updatePublicUserProfile } from '../Auth/utils'
import Google from '../../assets/google.svg'
import Logo from '../../assets/logo.svg'
import { useHistory } from 'react-router-dom'
import { useAuthContext } from '../Auth/Auth'
import Header from '../Header/Header'
import Menu from '../Menu/Menu'
import { getAuthenticatedUser } from '../Auth/utils'
import './Login.scss'

function Login() {
  const history = useHistory()
  const { user } = useAuthContext()

  useEffect(() => {
    if (user) history.push('/')
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogin() {
    const user = await getAuthenticatedUser()
    updatePublicUserProfile(user)
    history.push('/')
  }

  return (
    <main id="Login">
      <Header />
      <Menu />
      <img src={Logo} alt="Sharing Excess Logo" />
      <h1>Sharing Excess User Login</h1>
      <button className="google" onClick={handleLogin}>
        <img src={Google} alt="Google Logo" />
        Sign in with Google
      </button>
    </main>
  )
}

export default memo(Login)
