import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { FIREBASE_CONFIG, SENTRY_DSN } from './helpers/constants'
import firebase from 'firebase/app'
import Firestore from './components/Firestore/Firestore'
import Error from './components/Error/Error'
import Auth from './components/Auth/Auth'
import Menu from './components/Menu/Menu'
import useWidth from './hooks/useWidth'
import { Provider } from 'react-redux'
import { resize, setDarkMode } from './redux/app/appReducer'
import store from './redux/store'
import AdminRoutes from './routes/AdminRoutes'
import PickupReport from './components/PickupReport/PickupReport'
import Profile from './components/Profile/Profile'
import Routes from './components/Routes/Routes'
import { Route as DriverRoute } from './components/Route/Route'
import Calendar from './components/Calendar/Calendar'
import ContactUs from './components/ContactUs/ContactUs'
import FoodSafety from './components/FoodSafety/FoodSafety'
import DeliveryReport from './components/DeliveryReport/DeliveryReport'
import Privacy from './components/Privacy/Privacy'
import Terms from './components/Terms/Terms'
import * as Sentry from '@sentry/react'
import { Integrations as TracingIntegrations } from '@sentry/tracing'
import CompletedRoute from './components/CompletedRoute/CompletedRoute'
import Footer from './components/Footer/Footer'
import Home from './components/Home/Home'
import './styles/index.scss'

Sentry.init({
  dsn: SENTRY_DSN,
  autoSessionTracking: true,
  integrations: [new TracingIntegrations.BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 0.2,
})

// This function call connects us to Firebase and initializes all of our API access
firebase.initializeApp(FIREBASE_CONFIG)

function App() {
  // this is a state variable that will update whenever the window size changes
  const width = useWidth()

  // useEffect function will run when the component is mounted,
  // then each time the component's state changes, and finally when a component is un-mounting.
  // The first argument is the function to run on change, and the second is an array of dependencies.
  // If the second argument is present, useEffect will only run when those values change, not all state.
  // Read more: https://reactjs.org/docs/hooks-effect.html
  useEffect(() => {
    const savedDarkModePreference = localStorage.getItem('darkMode')
    if (savedDarkModePreference !== null) {
      store.dispatch(
        setDarkMode(savedDarkModePreference === 'true' ? true : false)
      )
    }
  }, [])

  useEffect(() => {
    // any time the screen width changes, handle the resize with this dispatch call
    store.dispatch(resize({ width }))
  }, [width])

  return (
    <Sentry.ErrorBoundary fallback={<Error crash />}>
      <Provider store={store}>
        {/* This Provider component wraps our app in a component that gives access to the Redux store */}
        <BrowserRouter>
          <Auth>
            <Firestore>
              <Menu />
              <Footer />
              {/* Header and Menu will be rendered on all routes because it is outside the Switch */}
              {/* Auth component handles login and will show a login page if no user is authenticated */}
              {/* Switch will only allows the first matching route to be rendered */}
              <Switch>
                <Route exact path="/">
                  <Home />
                </Route>
                <Route exact path="/calendar">
                  <Calendar />
                </Route>
                <Route exact path="/routes">
                  <Routes initial_filter={r => [1, 3].includes(r.status)} />
                </Route>
                <Route exact path="/history">
                  <Routes initial_filter={r => [0, 9].includes(r.status)} />
                </Route>
                <Route exact path="/routes/:route_id">
                  <DriverRoute />
                </Route>
                <Route exact path="/routes/:route_id/pickup/:pickup_id">
                  <PickupReport />
                </Route>
                <Route exact path="/routes/:route_id/delivery/:delivery_id">
                  <DeliveryReport />
                </Route>
                <Route exact path="/routes/:route_id/completed">
                  <CompletedRoute />
                </Route>
                <Route exact path="/profile">
                  <Profile />
                </Route>
                {/* We import all the Admin Routes from a separate file for security, see routes/AdminRoutes.js */}
                <Route path="/admin">
                  <AdminRoutes />
                </Route>
                <Route exact path="/privacy">
                  <Privacy />
                </Route>
                <Route exact path="/tos">
                  <Terms />
                </Route>
                <Route exact path="/contact">
                  <ContactUs />
                </Route>
                <Route exact path="/foodsafety">
                  <FoodSafety />
                </Route>
                <Route>
                  {/* This route has no path, and therefore will be the 'catch all' */}
                  <Error />
                  {/* this 404 page component will render if the url does not match any other routes */}
                </Route>
              </Switch>
            </Firestore>
          </Auth>
        </BrowserRouter>
      </Provider>
    </Sentry.ErrorBoundary>
  )
}

// this function call will render our React app into the DOM inside <div id='root'>
// you can find that div in public/index.html
ReactDOM.render(<App />, document.getElementById('root'))
