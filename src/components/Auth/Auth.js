import React, { useEffect, useState } from 'react'
import firebase from 'firebase/app'
import { useDispatch, useSelector } from 'react-redux'
import { login, updateAuth } from '../../redux/auth/authReducer'
import Loading from '../Loading/Loading'
import Logo from '../../assets/logo.svg'
import Google from '../../assets/google.svg'
import './Auth.scss'

export default function Auth({ children }) {
  const auth = useSelector(store => store.auth)
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    return firebase.auth().onAuthStateChanged(data => {
      dispatch(updateAuth(data))
      setLoading(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function Login() {
    return (
      <main id="Login">
        <h1>
          <span className="green">Sharing</span> Excess
        </h1>
        <img className="background" src={Logo} alt="Sharing Excess Logo" />
        <button onClick={() => dispatch(login())}>
          <img src={Google} alt="Google Logo" />
          Sign in with Google
        </button>
      </main>
    )
  }

  return loading ? (
    <Loading text={'Signing in'} />
  ) : auth.uid ? (
    <>{children}</>
  ) : (
    <Login />
  )
}
