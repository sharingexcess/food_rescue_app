import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route } from 'react-router-dom'
import { Provider, useDispatch } from 'react-redux'
import store from './redux/store'
import { resize } from './redux/app/appReducer'
import Auth from './components/Auth/Auth'
import Header from './components/Header/Header'
import useWidth from './hooks/useWidth'
import './styles/index.scss'
import Menu from './components/Menu/Menu'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/analytics'
import { logout } from './redux/auth/authReducer'
import { FIREBASE_CONFIG } from './helpers/constants'
import Schedule from './components/Schedule/Schedule'
import Home from './components/Home/Home'

if (!firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG)
} else {
  firebase.app() // if already initialized, use that one
}

function Routes() {
  const width = useWidth()

  useEffect(() => {
    store.dispatch(resize({ width }))
  }, [width])

  return (
    <BrowserRouter>
      <Header />
      <Menu />
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/schedule">
        <Schedule />
      </Route>
    </BrowserRouter>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Auth>
        <Routes />
      </Auth>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
