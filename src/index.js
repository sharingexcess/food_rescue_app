import React, { Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { FIREBASE_CONFIG } from './helpers/constants'
import firebase from 'firebase/app'
import Header from './components/Header/Header'
import Error from './components/Error/Error'
import Auth from './components/Auth/Auth'
import Menu from './components/Menu/Menu'
import useWidth from './hooks/useWidth'
import { Provider } from 'react-redux'
import { resize } from './redux/app/appReducer'
import store from './redux/store'
import './styles/index.scss'
import AdminRoutes from './routes/AdminRoutes'
import Loading from './components/Loading/Loading'
import Home from './components/Home/Home'
import EditRescue from './components/EditRescue/EditRescue'
import Rescues from './components/Rescues/Rescues'
import Rescue from './components/Rescue/Rescue'
import Report from './components/Report/Report'
import Profile from './components/Profile/Profile'

console.log('INITIALIZING FIREBASE CONFIG', process.env.REACT_APP_FIREBASE_ENV)
firebase.initializeApp(FIREBASE_CONFIG)

function App() {
  const width = useWidth()

  useEffect(() => {
    // any time the screen width changes, handle the resize with this dispatch call
    store.dispatch(resize({ width }))
  }, [width])

  return (
    <Suspense fallback={<Loading />}>
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
              <Route exact path="/create">
                <EditRescue />
              </Route>
              <Route exact path="/rescues">
                <Rescues />
              </Route>
              <Route exact path="/rescues/:id">
                <Rescue />
              </Route>
              <Route exact path="/rescues/:id/report">
                <Report />
              </Route>
              <Route exact path="/profile">
                <Profile />
              </Route>
              <AdminRoutes />
              {/* This route has no path, and therefore will be the 'catch all' */}
              <Route>
                {/* this 404 page component will render if the url does not match any other routes */}
                <Error />
              </Route>
            </Switch>
          </BrowserRouter>
        </Auth>
      </Provider>
    </Suspense>
  )
}

// this function call will render our React app into the DOM inside <div id='root'>
// you can find that div in public/index.html
ReactDOM.render(<App />, document.getElementById('root'))
