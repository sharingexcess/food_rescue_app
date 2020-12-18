import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/auth'
import { resize } from './redux/app/appReducer'
import Schedule from './components/Schedule/Schedule'
import Header from './components/Header/Header'
import Error from './components/Error/Error'
import Auth from './components/Auth/Auth'
import Menu from './components/Menu/Menu'
import Home from './components/Home/Home'
import useWidth from './hooks/useWidth'
import { Provider } from 'react-redux'
import store from './redux/store'
import './styles/index.scss'
import { FIREBASE_CONFIG } from './helpers/constants'

firebase.initializeApp(FIREBASE_CONFIG)

function App() {
  const width = useWidth()

  useEffect(() => {
    // any time the screen width changes, handle the resize with this dispatch call
    store.dispatch(resize({ width }))
  }, [width])

  return (
    <Provider store={store}>
      {/* this Provider component wraps our app in a component that gives access to the Redux store */}
      <Auth>
        {/* Auth component handles login and will show a login page if no user is authenticated */}
        <BrowserRouter>
          {/* Header and Menu will be rendered on all routes because it is outside the Switch */}
          <Header />
          <Menu />
          {/* Switch will only allows the first matching route to be rendered */}
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/schedule">
              <Schedule />
            </Route>
            {/* This route has no path, and therefore will be the 'catch all' */}
            <Route>
              {/* this 404 page component will render if the url does not match any other routes */}
              <Error />
            </Route>
          </Switch>
        </BrowserRouter>
      </Auth>
    </Provider>
  )
}

// this function call will render our React app into the DOM inside <div id='root'>
// you can find that div in public/index.html
ReactDOM.render(<App />, document.getElementById('root'))
