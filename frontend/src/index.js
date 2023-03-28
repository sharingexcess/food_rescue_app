import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { ChakraProvider } from '@chakra-ui/react'
import {
  CreateOrganization,
  ScheduleRescue,
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
  WholesaleRescue,
  FoodSafety,
  LogRescue,
  Privacy,
  Legal,
  Help,
  Page,
  Error,
} from './components'
import { Auth } from 'contexts'
import { SENTRY_DSN, SENTRY_ENV, VERSION } from 'helpers'
import theme from 'styles/theme'
import './styles/index.css'

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

function RescueAppRoutes() {
  return (
    <ChakraProvider theme={theme}>
      <Sentry.ErrorBoundary fallback={<Error crash />}>
        <BrowserRouter>
          <Auth>
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
                    Content={EditRescue}
                  />
                }
              />
              <Route
                path="/schedule-rescue"
                element={
                  <Page
                    defaultTitle="Schedule Rescue"
                    pullToRefresh={false}
                    defaultBreadcrumbs={[
                      { label: 'Rescues', link: '/rescues' },
                      { label: 'Schedule', link: 'schedule-rescue' },
                    ]}
                    Content={ScheduleRescue}
                  />
                }
              />
              <Route
                path="/log-rescue"
                element={
                  <Page
                    defaultTitle="Log Rescue"
                    pullToRefresh={false}
                    defaultBreadcrumbs={[
                      { label: 'Rescues', link: '/rescues' },
                      { label: 'Log', link: 'log-rescue' },
                    ]}
                    Content={LogRescue}
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
                    defaultBreadcrumbs={[{ label: 'People', link: '/people' }]}
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
                    id="WholesaleRescue"
                    defaultTitle="Wholesale"
                    defaultBreadcrumbs={[
                      { label: 'Wholesale', link: '/wholesale' },
                      { label: 'Loading...', link: '' },
                    ]}
                    Content={WholesaleRescue}
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
                    defaultBreadcrumbs={[
                      { label: 'Food Safety', link: '/food-safety' },
                    ]}
                  />
                }
              />
              <Route
                path="/privacy"
                element={
                  <Page
                    id="Privacy"
                    defaultBreadcrumbs={[
                      { label: 'Privacy', link: '/privacy' },
                    ]}
                    defaultTitle="Privacy"
                    Content={Privacy}
                  />
                }
              />
              <Route
                path="/legal"
                element={
                  <Page
                    id="Legal"
                    defaultBreadcrumbs={[{ label: 'Legal', link: '/legal' }]}
                    defaultTitle="Legal"
                    Content={Legal}
                  />
                }
              />
              <Route
                path="/help"
                element={
                  <Page
                    id="Help"
                    defaultBreadcrumbs={[{ label: 'Help', link: '/help' }]}
                    defaultTitle="Help"
                    Content={Help}
                  />
                }
              />
              <Route
                path="*"
                element={
                  <Page id="Error" defaultTitle="Uh oh..." Content={Error} />
                }
              />
            </Routes>
          </Auth>
        </BrowserRouter>
      </Sentry.ErrorBoundary>
    </ChakraProvider>
  )
}

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<RescueAppRoutes />)
