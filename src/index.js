import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import firebase from 'firebase/compat/app'
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

function PublicRoute({ children }) {
  return (
    <>
      <Header />
      {children}
      <Modal />
      <EnvWarning />
    </>
  )
}

function DriverRoute({ children }) {
  const { permission } = useAuth()
  return permission ? (
    <>
      <Header />
      {children}
      <Modal />
      <EnvWarning />
    </>
  ) : (
    <Navigate to="/error" />
  )
}

function AdminRoute({ children }) {
  const { admin } = useAuth()
  return admin ? (
    <>
      <Header />
      {children}
      <Modal />
      <EnvWarning />
    </>
  ) : (
    <Navigate to="/error" />
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
                <Routes>
                  {/* Public Routes */}
                  <Route
                    path="/"
                    element={
                      <PublicRoute>
                        <Home />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      <PublicRoute>
                        <Profile />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="privacy"
                    element={
                      <PublicRoute>
                        <Privacy />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/tos"
                    element={
                      <PublicRoute>
                        <Terms />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/contact"
                    element={
                      <PublicRoute>
                        <ContactUs />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/food-safety"
                    element={
                      <PublicRoute>
                        <FoodSafety />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/liability"
                    element={
                      <PublicRoute>
                        <Liability />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/driver-info"
                    element={
                      <PublicRoute>
                        <DriverInfo />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/tutorial"
                    element={
                      <PublicRoute>
                        <Tutorial />
                      </PublicRoute>
                    }
                  />

                  {/* Driver Routes */}
                  <Route
                    path="/calendar"
                    element={
                      <DriverRoute>
                        <Calendar />
                      </DriverRoute>
                    }
                  />
                  <Route
                    path="/rescues"
                    element={
                      <DriverRoute>
                        <Rescues />
                      </DriverRoute>
                    }
                  />
                  <Route
                    path="/rescues/:rescue_id"
                    element={
                      <DriverRoute>
                        <Rescue />
                      </DriverRoute>
                    }
                  />
                  <Route
                    path="/rescues/:rescue_id/pickup/:pickup_id"
                    element={
                      <DriverRoute>
                        <PickupReport />
                      </DriverRoute>
                    }
                  />
                  <Route
                    path="/rescues/:rescue_id/delivery/:delivery_id"
                    element={
                      <DriverRoute>
                        <DeliveryReport />
                      </DriverRoute>
                    }
                  />
                  <Route
                    path="/rescues/:rescue_id/edit"
                    element={
                      <DriverRoute>
                        <EditRescue />
                      </DriverRoute>
                    }
                  />
                  <Route
                    path="/rescues/:rescue_id/completed"
                    element={
                      <DriverRoute>
                        <CompletedRescue />
                      </DriverRoute>
                    }
                  />
                  <Route
                    path="/stats"
                    element={
                      <DriverRoute>
                        <DriverStats />
                      </DriverRoute>
                    }
                  />
                  {/* Admin Routes */}

                  <Route
                    path="/admin/create-rescue"
                    element={
                      <AdminRoute>
                        <EditRescue />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/log-rescue"
                    element={
                      <AdminRoute>
                        <LogRescue />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/create-organization"
                    element={
                      <AdminRoute>
                        <EditOrganization />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/organizations"
                    element={
                      <AdminRoute>
                        <Organizations />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/organizations/:organization_id"
                    element={
                      <AdminRoute>
                        <Organization />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/organizations/:organization_id/edit"
                    element={
                      <AdminRoute>
                        <EditOrganization />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/organizations/:organization_id/create-location"
                    element={
                      <AdminRoute>
                        <EditLocation />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/organizations/:organization_id/location/:location_id"
                    element={
                      <AdminRoute>
                        <EditLocation />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <AdminRoute>
                        <Users />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users/:id"
                    element={
                      <AdminRoute>
                        <User />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <AdminRoute>
                        <Analytics />
                      </AdminRoute>
                    }
                  />
                  <Route path="*" element={<Error />} />
                </Routes>
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
