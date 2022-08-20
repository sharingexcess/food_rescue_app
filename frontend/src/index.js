import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { ChakraProvider } from '@chakra-ui/react'
import { Error, EnvWarning } from 'components'
import {
  CreateOrganization,
  CreateRescue,
  EditRescue,
  Organization,
  CreateLocation,
  EditLocation,
  Organizations,
  Profile,
  Rescue,
  Rescues,
  User,
  Users,
  Home,
  Wholesale,
  WholesaleDonation,
  FoodSafety,
  Page,
  Analytics,
} from './chakra_components'
import { Auth, App } from 'contexts'
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

function PublicRoute({ children }) {
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
                  path="/"
                  element={
                    <Page
                      defaultTitle="Home"
                      pageContentStyle={{ px: 0, pt: 8, mt: '-64px' }}
                      Content={Home}
                    />
                  }
                />
                <Route
                  path="/rescues"
                  element={
                    <Page
                      defaultTitle="Rescues"
                      defaultBreadcrumbs={[
                        { label: 'Rescues', link: '/rescues' },
                      ]}
                      Content={Rescues}
                    />
                  }
                />
                <Route
                  path="/rescues/:rescue_id"
                  element={
                    <Page
                      defaultTitle="Loading Rescue"
                      defaultBreadcrumbs={[
                        { label: 'Rescues', link: '/rescues' },
                        { label: 'Loading...', link: '' },
                      ]}
                      Content={Rescue}
                      pageContentStyle={{ px: 0, pt: 8, mt: '-64px' }}
                    />
                  }
                />
                <Route
                  path="/rescues/:rescue_id/edit"
                  element={
                    <Page
                      defaultTitle="Loading Rescue"
                      defaultBreadcrumbs={[
                        { label: 'Rescues', link: '/rescues' },
                        { label: 'Loading...', link: '' },
                      ]}
                      pullToRefresh={false}
                      pageContentStyle={{ overflow: 'hidden', maxH: '100vh' }}
                      Content={EditRescue}
                    />
                  }
                />
                <Route
                  path="/create-rescue"
                  element={
                    <Page
                      defaultTitle="Create Rescue"
                      pullToRefresh={false}
                      defaultBreadcrumbs={[
                        { label: 'Rescues', link: '/rescues' },
                        { label: 'Create', link: '/create-rescue' },
                      ]}
                      Content={CreateRescue}
                    />
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <Page
                      defaultTitle="Profile"
                      defaultBreadcrumbs={[
                        { label: 'Profile', link: '/profile' },
                      ]}
                      Content={Profile}
                    />
                  }
                />
                <Route
                  path="/people"
                  element={
                    <Page
                      id="Users"
                      defaultTitle="People"
                      defaultBreadcrumbs={[
                        { label: 'People', link: '/people' },
                      ]}
                      Content={Users}
                    />
                  }
                />
                <Route
                  path="/people/:user_id"
                  element={
                    <Page
                      id="User"
                      defaultTitle="Loading Profile"
                      defaultBreadcrumbs={[
                        { label: 'People', link: '/people' },
                        { label: 'Loading', link: '' },
                      ]}
                      Content={User}
                    />
                  }
                />
                <Route
                  path="/organizations"
                  element={
                    <Page
                      id="Organizations"
                      defaultTitle="Organizations"
                      defaultBreadcrumbs={[
                        { label: 'Organizations', link: '/organizations' },
                      ]}
                      Content={Organizations}
                    />
                  }
                />
                <Route
                  path="/organizations/:organization_id"
                  element={
                    <Page
                      id="Organizations"
                      defaultTitle="Loading Organization"
                      defaultBreadcrumbs={[
                        { label: 'Organizations', link: '/organizations' },
                        { label: 'Loading...', link: '' },
                      ]}
                      Content={Organization}
                    />
                  }
                />
                <Route
                  path="/create-organization"
                  element={
                    <Page
                      id="CreateOrganization"
                      defaultTitle="Create Organization"
                      defaultBreadcrumbs={[
                        { label: 'Organizations', link: '/organizations' },
                        { label: 'Create', link: '/create-organization' },
                      ]}
                      Content={CreateOrganization}
                    />
                  }
                />
                <Route
                  path="/organizations/:organization_id/create-location"
                  element={
                    <Page
                      id="CreateLocation"
                      defaultTitle="Create Location"
                      defaultBreadcrumbs={[
                        {
                          label: 'Organizations',
                          link: '/organizations',
                        },
                        {
                          label: 'Loading',
                          link: '',
                        },
                      ]}
                      Content={CreateLocation}
                    />
                  }
                />
                <Route
                  path="/organizations/:organization_id/locations/:location_id"
                  element={
                    <Page
                      id="EditLocation"
                      defaultTitle="Edit Location"
                      defaultBreadcrumbs={[
                        {
                          label: 'Organizations',
                          link: '/organizations',
                        },
                        {
                          label: 'Loading',
                          link: '',
                        },
                      ]}
                      Content={EditLocation}
                    />
                  }
                />
                <Route
                  path="/wholesale"
                  element={
                    <Page
                      id="Wholesale"
                      defaultTitle="Wholesale"
                      defaultBreadcrumbs={[
                        { label: 'Wholesale', link: '/wholesale' },
                      ]}
                      Content={Wholesale}
                    />
                  }
                />
                <Route
                  path="/wholesale/:id"
                  element={
                    <Page
                      id="WholesaleDonation"
                      defaultTitle="Wholesale"
                      defaultBreadcrumbs={[
                        { label: 'Wholesale', link: '/wholesale' },
                        { label: 'Loading...', link: '' },
                      ]}
                      Content={WholesaleDonation}
                    />
                  }
                />
                <Route
                  path="/food-safety"
                  element={
                    <Page
                      id="FoodSafety"
                      defaultTitle="Food Safety"
                      Content={FoodSafety}
                    />
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <Page
                      id="Analytics"
                      title="Analytics"
                      defaultBreadcrumbs={[
                        { label: 'Analytics', link: '/analytics' },
                      ]}
                      defaultTitle="Analytics"
                      Content={Analytics}
                    />
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
