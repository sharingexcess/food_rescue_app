import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import firebase from 'firebase/app'
import {
  Calendar,
  CompletedRescue,
  ContactUs,
  DeliveryReport,
  DriverInfo,
  EditRescue,
  Error,
  FoodSafety,
  Header,
  Home,
  Liability,
  PickupReport,
  Privacy,
  Profile,
  Rescues,
  Terms,
  Tutorial,
  Rescue,
  LogRescue,
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
  DriverStats,
} from 'components'
import { Firestore, Auth, App } from 'contexts'
import { useAuth } from 'hooks'
import { FIREBASE_CONFIG, SENTRY_DSN, SENTRY_ENV, VERSION } from 'helpers'
import { EmojiProvider } from 'react-apple-emojis'
import emojiData from 'react-apple-emojis/lib/data.json'
import './styles/index.scss'

Sentry.init({
  dsn: SENTRY_DSN,
  autoSessionTracking: true,
  integrations: [new Integrations.BrowserTracing()],
  env: SENTRY_ENV,
  release: VERSION,
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

function PublicRoute({ children, exact, path }) {
  return (
    <Route exact={exact} path={path}>
      <Header />
      {children}
      <Modal />
      <EnvWarning />
    </Route>
  )
}

function DriverRoute({ children, exact, path }) {
  const { permission } = useAuth()
  return permission ? (
    <Route exact={exact} path={path}>
      <Header />
      {children}
      <Modal />
      <EnvWarning />
    </Route>
  ) : (
    <Error message="Only registered users have permission to view this page." />
  )
}

function AdminRoute({ children, exact, path }) {
  const { admin } = useAuth()
  return admin ? (
    <Route exact={exact} path={path}>
      <Header />
      {children}
      <Modal />
      <EnvWarning />
    </Route>
  ) : (
    <Error message="Only admins have permission to view this page." />
  )
}

function RescueAppRoutes() {
  return (
    <Sentry.ErrorBoundary fallback={<Error crash />}>
      <EmojiProvider data={emojiData}>
        <BrowserRouter>
          <Auth>
            {/* Auth component handles login and will show a login page if no user is authenticated */}
            <Firestore>
              <App>
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
                  <DriverRoute exact path="/rescues">
                    <Rescues />
                  </DriverRoute>
                  <DriverRoute exact path="/rescues/:rescue_id">
                    <Rescue />
                  </DriverRoute>
                  <DriverRoute
                    exact
                    path="/rescues/:rescue_id/pickup/:pickup_id"
                  >
                    <PickupReport />
                  </DriverRoute>
                  <DriverRoute
                    exact
                    path="/rescues/:rescue_id/delivery/:delivery_id"
                  >
                    <DeliveryReport />
                  </DriverRoute>
                  <DriverRoute exact path="/rescues/:rescue_id/edit">
                    <EditRescue />
                  </DriverRoute>
                  <DriverRoute exact path="/rescues/:rescue_id/completed">
                    <CompletedRescue />
                  </DriverRoute>
                  <DriverRoute exact path="/stats">
                    <DriverStats />
                  </DriverRoute>

                  {/* Admin Routes */}

                  <AdminRoute exact path="/admin/create-rescue">
                    <EditRescue />
                  </AdminRoute>
                  <AdminRoute exact path="/admin/log-rescue">
                    <LogRescue />
                  </AdminRoute>
                  <AdminRoute exact path="/admin/create-organization">
                    <EditOrganization />
                  </AdminRoute>
                  <AdminRoute exact path="/admin/organizations">
                    <Organizations />
                  </AdminRoute>

                  <AdminRoute
                    exact
                    path="/admin/organizations/:organization_id"
                  >
                    <Organization />
                  </AdminRoute>
                  <AdminRoute
                    exact
                    path="/admin/organizations/:organization_id/edit"
                  >
                    <EditOrganization />
                  </AdminRoute>
                  <AdminRoute
                    exact
                    path="/admin/organizations/:organization_id/create-location"
                  >
                    <EditLocation />
                  </AdminRoute>
                  <AdminRoute
                    exact
                    path="/admin/organizations/:organization_id/location/:location_id"
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
      </EmojiProvider>
    </Sentry.ErrorBoundary>
  )
}

// this function call will render our React app into the DOM inside <div id='root'>
// you can find that div in public/index.html
ReactDOM.render(<RescueAppRoutes />, document.getElementById('root'))
