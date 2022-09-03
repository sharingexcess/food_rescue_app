const express = require('express')
const cors = require('cors')
const Sentry = require('@sentry/node')

// initialize express server
const api = express()

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.SENTRY_ENV,
})

// The request handler must be the first middleware on the app
api.use(Sentry.Handlers.requestHandler())
api.use(cors({ origin: true }))

// define api endpoints
api.get('/', (_request, response) =>
  response.send(
    `Sharing Excess API, ©${new Date().getFullYear()}, All Rights Reserved.`
  )
)
api.get('/rescues', (req, res, next) => loadEndpoint('rescues', req, res, next))
api.get('/rescues/:id', (req, res, next) =>
  loadEndpoint('rescue', req, res, next)
)
api.get('/stops', (req, res, next) => loadEndpoint('stops', req, res, next))
api.get('/stops/:id', (req, res, next) => loadEndpoint('stop', req, res, next))
api.get('/analytics', (req, res, next) =>
  loadEndpoint('analytics', req, res, next)
)
api.get('/impact', (req, res, next) => loadEndpoint('impact', req, res, next))
api.post('/calendar/add', (req, res, next) =>
  loadEndpoint('addCalendarEvent', req, res, next)
)
api.post('/calendar/delete', (req, res, next) =>
  loadEndpoint('deleteCalendarEvent', req, res, next)
)
api.post('/rescues/:id/update', (req, res, next) =>
  loadEndpoint('updateRescue', req, res, next)
)
api.post('/stops/:id/create', (req, res, next) =>
  loadEndpoint('createStop', req, res, next)
)
api.post('/stops/:id/update', (req, res, next) =>
  loadEndpoint('updateStop', req, res, next)
)
api.post('/rescues/:id/cancel', (req, res, middlewareHandler) =>
  loadEndpoint('cancelRescue', req, res, middlewareHandler)
)
api.post('/rescues/:id/:type/:stop_id/cancel', (req, res, next) =>
  loadEndpoint('cancelStop', req, res, next)
)
api.get('/reports', (req, res, next) => loadEndpoint('reports', req, res, next))

api.post('/rescues/:id/create', (req, res, next) =>
  loadEndpoint('createRescue', req, res, next)
)
api.get('/organization/:id', (req, res, next) =>
  loadEndpoint('organization', req, res, next)
)
api.post('/organization/:id/update', (req, res, next) =>
  loadEndpoint('updateOrganization', req, res, next)
)
api.get('/organizations', (req, res, next) =>
  loadEndpoint('organizations', req, res, next)
)
api.post('/location/:id/update', (req, res, next) =>
  loadEndpoint('updateLocation', req, res, next)
)
api.get('/users', (req, res, next) => loadEndpoint('users', req, res, next))
api.get('/user/:id', (req, res, next) => loadEndpoint('user', req, res, next))
api.get('/publicProfiles', (req, res, next) =>
  loadEndpoint('publicProfiles', req, res, next)
)
api.get('/publicProfiles/:id', (req, res, next) =>
  loadEndpoint('publicProfile', req, res, next)
)
api.get('/privateProfiles/:id', (req, res, next) =>
  loadEndpoint('privateProfile', req, res, next)
)
api.post('/publicProfile/:id/update', (req, res, next) =>
  loadEndpoint('updatePublicProfile', req, res, next)
)
api.post('/privateProfile/:id/update', (req, res, next) =>
  loadEndpoint('updatePrivateProfile', req, res, next)
)
api.post('/updateUserPermission/:id', (req, res, next) =>
  loadEndpoint('updateUserPermission', req, res, next)
)

api.get('/getCachedDataReports', (req, res, next) =>
  loadEndpoint('getCachedDataReports', req, res, next)
)

api.post('/wholesale/rescue/create', (req, res, next) =>
  loadEndpoint('createWholesaleRescue', req, res, next)
)

api.post('/wholesale/rescue/:id/update', (req, res, next) =>
  loadEndpoint('updateWholesaleRescue', req, res, next)
)

api.post('/wholesale/rescue/:rescue_id/addRecipient', (req, res, next) =>
  loadEndpoint('addWholesaleRecipient', req, res, next)
)

api.post('/wholesale/rescue/:rescue_id/updateRecipient/:id', (req, res, next) =>
  loadEndpoint('updateWholesaleRecipient', req, res, next)
)

// THIS IS A PROD RESCUE UPDATE SCRIPT, LEAVING IN PLACE FOR NOW BUT DO NOT USE
// api.get('/updateRescueType', (req, res, next) =>
//   loadEndpoint('updateRescueType', req, res, next)
// )

// we do this to dynamically load only the necessary endpoint code and improve cold start/runtime performance
function loadEndpoint(name, request, response, next) {
  const module = require(`./${name}`)
  const endpoint = module[`${name}Endpoint`]
  return endpoint(request, response, next)
}

api.use(Sentry.Handlers.errorHandler())
api.use(function onError(err, _req, res, _next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  console.log('HANDLING ERROR WITH SENTRY RESPONSE:', err)
  res.statusCode = 500
  res.end(res.sentry + '\n')
})

// export express server instance
exports.api = api
