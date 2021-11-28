import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route as PublicRoute, Switch } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import firebase from 'firebase/app'
import {
  Calendar,
  CompletedRoute,
  ContactUs,
  DeliveryReport,
  DriverInfo,
  EditRoute,
  Error,
  FoodSafety,
  Header,
  Home,
  Liability,
  PickupReport,
  Privacy,
  Profile,
  Routes,
  Terms,
  Tutorial,
  Route,
  EditDirectDonation,
  EditOrganization,
  Organizations,
  Organization,
  EditLocation,
  Users,
  User,
  Analytics,
  SwitchEnv,
  Modal,
  EnvWarning,
} from 'components'
import { Firestore, Auth, App } from 'contexts'
import { useAuth } from 'hooks'
import { FIREBASE_CONFIG, SENTRY_DSN, SENTRY_ENV } from 'helpers'
import './styles/index.scss'

Sentry.init({
  dsn: SENTRY_DSN,
  autoSessionTracking: true,
  integrations: [new Integrations.BrowserTracing()],
  env: SENTRY_ENV,
})

// This function call connects us to Firebase and initializes all of our API access
firebase.initializeApp(FIREBASE_CONFIG)

// handle installed on home screen
let debounce
if (window.matchMedia('(display-mode: standalone)').matches) {
  window.scrollTo({ top: 54, behavior: 'smooth' })

  window.addEventListener('scroll', () => {
    if (window.scrollY < 54) {
      if (debounce) window.clearTimeout(debounce)
      debounce = window.setTimeout(
        () => window.scrollTo({ top: 54, behavior: 'smooth' }),
        50
      )
    }
  })
}

function DriverRoute({ children, exact, path }) {
  const { permission } = useAuth()
  return permission ? (
    <PublicRoute exact={exact} path={path}>
      {children}
    </PublicRoute>
  ) : (
    <Error message="Only registered users have permission to view this page." />
  )
}

function AdminRoute({ children, exact, path }) {
  const { admin } = useAuth()
  return admin ? (
    <PublicRoute exact={exact} path={path}>
      {children}
    </PublicRoute>
  ) : (
    <Error message="Only admins have permission to view this page." />
  )
}

function RescueAppRoutes() {
  return (
    <Sentry.ErrorBoundary fallback={<Error crash />}>
      <BrowserRouter>
        <Auth>
          {/* Auth component handles login and will show a login page if no user is authenticated */}
          <Firestore>
            <App>
              <Header />
              <Modal />
              <EnvWarning />
              <Switch>
                {/* Public Routes */}
                <PublicRoute exact path="/">
                  <Home />
                </PublicRoute>
                <PublicRoute exact path="/profile">
                  <Profile />
                </PublicRoute>
                <PublicRoute exact path="/privacy">
                  <Privacy />
                </PublicRoute>
                <PublicRoute exact path="/tos">
                  <Terms />
                </PublicRoute>
                <PublicRoute exact path="/contact">
                  <ContactUs />
                </PublicRoute>
                <PublicRoute exact path="/food-safety">
                  <FoodSafety />
                </PublicRoute>
                <PublicRoute exact path="/liability">
                  <Liability />
                </PublicRoute>
                <PublicRoute exact path="/driver-info">
                  <DriverInfo />
                </PublicRoute>
                <PublicRoute exact path="/tutorial">
                  <Tutorial />
                </PublicRoute>

                {/* Driver Routes */}
                <DriverRoute exact path="/calendar">
                  <Calendar />
                </DriverRoute>
                <DriverRoute exact path="/routes">
                  <Routes initial_filter={r => [1, 3].includes(r.status)} />
                </DriverRoute>
                <DriverRoute exact path="/history">
                  <Routes initial_filter={r => [0, 9].includes(r.status)} />
                </DriverRoute>
                <DriverRoute exact path="/history/:route_id">
                  <Route />
                </DriverRoute>
                <DriverRoute exact path="/history/:route_id/pickup/:pickup_id">
                  <PickupReport />
                </DriverRoute>
                <DriverRoute
                  exact
                  path="/history/:route_id/delivery/:delivery_id"
                >
                  <DeliveryReport />
                </DriverRoute>
                <DriverRoute exact path="/routes/:route_id">
                  <Route />
                </DriverRoute>
                <DriverRoute exact path="/routes/:route_id/pickup/:pickup_id">
                  <PickupReport />
                </DriverRoute>
                <DriverRoute
                  exact
                  path="/routes/:route_id/delivery/:delivery_id"
                >
                  <DeliveryReport />
                </DriverRoute>
                <DriverRoute exact path="/routes/:route_id/edit">
                  <EditRoute />
                </DriverRoute>
                <DriverRoute exact path="/routes/:route_id/completed">
                  <CompletedRoute />
                </DriverRoute>

                {/* Admin Routes */}

                <AdminRoute exact path="/admin/create-route">
                  <EditRoute />
                </AdminRoute>
                <AdminRoute exact path="/admin/create-direct-donation">
                  <EditDirectDonation />
                </AdminRoute>
                <AdminRoute exact path="/admin/create-organization">
                  <EditOrganization />
                </AdminRoute>
                <AdminRoute exact path="/admin/organizations">
                  <Organizations />
                </AdminRoute>
                <AdminRoute exact path="/admin/organizations/:id">
                  {/* adding a colon creates a variable url parameter */}
                  {/* we can access that variable using const { id } = useParams() */}
                  <Organization />
                </AdminRoute>
                <AdminRoute exact path="/admin/organizations/:id/edit">
                  <EditOrganization />
                </AdminRoute>
                <AdminRoute
                  exact
                  path="/admin/organizations/:id/create-location"
                >
                  <EditLocation />
                </AdminRoute>
                <AdminRoute
                  exact
                  path="/admin/organizations/:id/location/:loc_id"
                >
                  <EditLocation />
                </AdminRoute>
                <AdminRoute exact path="/admin/users">
                  <Users />
                </AdminRoute>
                <AdminRoute exact path="/admin/users/:id">
                  <User />
                </AdminRoute>
                <AdminRoute exact path="/admin/analytics">
                  <Analytics />
                </AdminRoute>
                <AdminRoute exact path="/admin/switch-environment">
                  <SwitchEnv />
                </AdminRoute>

                {/* Catch All */}
                <Route>
                  {/* This route has no path, and therefore will be the 'catch all' */}
                  <Error />
                  {/* this 404 page component will render if the url does not match any other routes */}
                </Route>
              </Switch>
            </App>
          </Firestore>
        </Auth>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  )
}

// this function call will render our React app into the DOM inside <div id='root'>
// you can find that div in public/index.html
ReactDOM.render(<RescueAppRoutes />, document.getElementById('root'))
