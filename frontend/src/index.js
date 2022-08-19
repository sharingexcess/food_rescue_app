import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { ChakraProvider } from '@chakra-ui/react'
import { Error, Header, Modal, EnvWarning } from 'components'
import {
  ChakraTest,
  CreateOrganization as ChakraCreateOrganization,
  CreateRescue as ChakraCreateRescue,
  EditRescue as ChakraEditRescue,
  Organization as ChakraOrganization,
  CreateLocation as ChakraCreateLocation,
  EditLocation as ChakraEditLocation,
  Organizations as ChakraOrganizations,
  Profile as ChakraProfile,
  Rescue as ChakraRescue,
  Rescues as ChakraRescues,
  User as ChakraUser,
  Users as ChakraUsers,
  Home as ChakraHome,
  Wholesale,
  WholesaleDonation,
  FoodSafety,
} from './chakra_components'
import { Firestore, Auth, App } from 'contexts'
import { SENTRY_DSN, SENTRY_ENV, VERSION } from 'helpers'
import theme from 'styles/theme'
import './styles/index.scss'

// We use this window variable to turn on or off
// api logs. By using this window variable,
// we can turn on logs from the console in production.
// by default, we turn them on only for DEV, not PROD.
// window.se_api_logs = IS_DEV_ENVIRONMENT
window.se_api_logs = true

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: SENTRY_DSN,
    autoSessionTracking: true,
    integrations: [
      new Integrations.BrowserTracing(),
      new Sentry.Integrations.Breadcrumbs({
        console: false,
      }),
    ],
    env: SENTRY_ENV,
    release: VERSION,
  })
}

function PublicChakraRoute({ children }) {
  return (
    <>
      {children}
      <EnvWarning />
    </>
  )
}

function RescueAppRoutes() {
  return (
    <Sentry.ErrorBoundary fallback={<Error crash />}>
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <Auth>
            <App>
              <Routes>
                <Route
                  path="/rescues"
                  element={
                    <PublicChakraRoute>
                      <ChakraRescues />
                    </PublicChakraRoute>
                  }
                />
                <Route
                  path="/rescues/:rescue_id"
                  element={
                    <PublicChakraRoute>
                      <ChakraRescue />
                    </PublicChakraRoute>
                  }
                />
                <Route
                  path="/rescues/:rescue_id/edit"
                  element={
                    <PublicChakraRoute>
                      <ChakraEditRescue />
                    </PublicChakraRoute>
                  }
                />
                <Route
                  path="/create-rescue"
                  element={
                    <PublicChakraRoute>
                      <ChakraCreateRescue />
                    </PublicChakraRoute>
                  }
                />
                <Route
                  path="/test"
                  element={
                    <PublicChakraRoute>
                      <ChakraTest />
                    </PublicChakraRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PublicChakraRoute>
                      <ChakraProfile />
                    </PublicChakraRoute>
                  }
                />
                <Route
                  path="/people"
                  element={
                    <PublicChakraRoute>
                      <ChakraUsers />
                    </PublicChakraRoute>
                  }
                />
                <Route
                  path="/people/:person_id"
                  element={
                    <PublicChakraRoute>
                      <ChakraUser />
                    </PublicChakraRoute>
                  }
                />
                <Route
                  path="/organizations"
                  element={
                    <PublicChakraRoute>
                      <ChakraOrganizations />
                    </PublicChakraRoute>
                  }
                />
                <Route
                  path="/organizations/:organization_id"
                  element={
                    <PublicChakraRoute>
                      <ChakraOrganization />
                    </PublicChakraRoute>
                  }
                />
                <Route
                  path="/create-organization"
                  element={
                    <PublicChakraRoute>
                      <ChakraCreateOrganization />
                    </PublicChakraRoute>
                  }
                />
                <Route
                  path="/"
                  element={
                    <PublicChakraRoute>
                      <ChakraHome />
                    </PublicChakraRoute>
                  }
                />
                <Route
                  path="/wholesale"
                  element={
                    <PublicChakraRoute>
                      <Wholesale />
                    </PublicChakraRoute>
                  }
                />
                <Route
                  path="/wholesale/:id"
                  element={
                    <PublicChakraRoute>
                      <WholesaleDonation />
                    </PublicChakraRoute>
                  }
                />
                <Route
                  path="/food-safety"
                  element={
                    <PublicChakraRoute>
                      <FoodSafety />
                    </PublicChakraRoute>
                  }
                />
                <Route path="*" element={<Error />} />
              </Routes>
            </App>
          </Auth>
        </BrowserRouter>
      </ChakraProvider>
    </Sentry.ErrorBoundary>
  )
}

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<RescueAppRoutes />)
