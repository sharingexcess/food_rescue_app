import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import firebase from 'firebase/app'
import {
  Error,
  PickupReport,
  Profile,
  Routes,
  Route as DriverRoute,
  Calendar,
  ContactUs,
  FoodSafety,
  Liability,
  DeliveryReport,
  Privacy,
  Terms,
  CompletedRoute,
  Header,
  Home,
  EditRoute,
  DriverInfo,
  Tutorial,
} from 'components'
import { AdminRoutes } from './routes/AdminRoutes'
import { Firestore, Auth } from 'contexts'
import { ProtectedRoutes } from './helpers/components'
import { FIREBASE_CONFIG, SENTRY_DSN } from './helpers/constants'
import './styles/index.scss'

Sentry.init({
  dsn: SENTRY_DSN,
  autoSessionTracking: true,
  integrations: [new Integrations.BrowserTracing()],
})

// This function call connects us to Firebase and initializes all of our API access
firebase.initializeApp(FIREBASE_CONFIG)

function App() {
  return (
    <Sentry.ErrorBoundary fallback={<Error crash />}>
      <BrowserRouter>
        <Auth>
          {/* Auth component handles login and will show a login page if no user is authenticated */}
          <Firestore>
            <Header />
            {/* Switch will only allow the first matching route to be rendered */}
            <Switch>
              <Route exact path="/">
                <Home />
              </Route>
              <Route exact path="/profile">
                <Profile />
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
              <Route exact path="/liability">
                <Liability />
              </Route>
              <Route exact path="/driver-info">
                <DriverInfo />
              </Route>
              <Route exact path="/tutorial">
                <Tutorial />
              </Route>
              <ProtectedRoutes>
                <Route exact path="/calendar">
                  <Calendar />
                </Route>
                <Route exact path="/routes">
                  <Routes initial_filter={r => [1, 3].includes(r.status)} />
                </Route>
                <Route exact path="/history">
                  <Routes initial_filter={r => [0, 9].includes(r.status)} />
                </Route>
                <Route exact path="/history/:route_id">
                  <DriverRoute />
                </Route>
                <Route exact path="/history/:route_id/pickup/:pickup_id">
                  <PickupReport />
                </Route>
                <Route exact path="/history/:route_id/delivery/:delivery_id">
                  <DeliveryReport />
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
                <Route exact path="/routes/:route_id/edit">
                  <EditRoute />
                </Route>
                <Route exact path="/routes/:route_id/completed">
                  <CompletedRoute />
                </Route>
                {/* We import all the Admin Routes from a separate file for security, see routes/AdminRoutes.js */}
                <Route path="/admin">
                  <AdminRoutes />
                </Route>
              </ProtectedRoutes>
              <Route>
                {/* This route has no path, and therefore will be the 'catch all' */}
                <Error />
                {/* this 404 page component will render if the url does not match any other routes */}
              </Route>
            </Switch>
          </Firestore>
        </Auth>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  )
}

// this function call will render our React app into the DOM inside <div id='root'>
// you can find that div in public/index.html
ReactDOM.render(<App />, document.getElementById('root'))
