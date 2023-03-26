const express = require('express')
const cors = require('cors')
const Sentry = require('@sentry/node')
const {
  getTransferEndpoint,
  updateTransferEndpoint,
  createTransferEndpoint,
  listTransfersEndpoint,
  cancelTransferEndpoint,
} = require('./transfers/transferEndpoints')
const {
  migrateStopsToTransfers,
} = require('./transfers/migrateStopsToTransfers')
const { duplicateCollectionEndpoint } = require('./duplicateCollection')
const { migrateRescues } = require('./rescues/migrateRescues')
const { migratePublicProfiles } = require('./migratePublicProfiles')
const {
  updateLocationEndpoint,
  createLocationEndpoint,
} = require('./locations/locationEndpoints')
const {
  createOrganizationEndpoint,
  updateOrganizationEndpoint,
  listOrganizationsEndpoint,
  getOrganizationEndpoint,
} = require('./organizations/organizationEndpoints')
const {
  getPrivateProfileEndpoint,
  updatePrivateProfileEndpoint,
} = require('./private_profiles/privateProfileEndpoints')
const { repairStops } = require('./transfers/repairStops')
const { selectStopsForRepair } = require('./transfers/selectStopsForRepair')
const { uploadRepairedStops } = require('./transfers/uploadRepairedStops')
const {
  listRescuesEndpoint,
  getRescueEndpoint,
  createRescueEndpoint,
  updateRescueEndpoint,
  cancelRescueEndpoint,
} = require('./rescues/rescueEndpoints')

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

api.get('/stops/:id', (req, res, next) => loadEndpoint('stop', req, res, next))
api.get('/analytics', (req, res, next) =>
  loadEndpoint('analytics', req, res, next)
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

// THIS IS A PROD RESCUE UPDATE SCRIPT, LEAVING IN PLACE FOR NOW
// BUT READ THE DOCUMENTATION INSIDE THE FILE BEFORE RUNNING THIS
// api.get('/dangerous_manual_db_update_script', (req, res, next) =>
//   loadEndpoint('_dangerousManualDbUpdateScript', req, res, next)
// )

api.get('/figureShitOut', (req, res, next) =>
  loadEndpoint('figureShitOut', req, res, next)
)

//

//

// RESCUES

api.get('/rescues/list', (req, res, next) =>
  listRescuesEndpoint(req, res, next)
)
api.get('/rescues/get/:id', (req, res, next) =>
  getRescueEndpoint(req, res, next)
)
api.post('/rescues/create', (req, res, next) =>
  createRescueEndpoint(req, res, next)
)
api.post('/rescues/update/:id', (req, res, next) =>
  updateRescueEndpoint(req, res, next)
)
api.post('/rescues/cancel/:id', (req, res, next) =>
  cancelRescueEndpoint(req, res, next)
)

// TRANSFERS

api.get('/transfers/list', (req, res, next) =>
  listTransfersEndpoint(req, res, next)
)
api.get('/transfers/get/:id', (req, res, next) =>
  getTransferEndpoint(req, res, next)
)
api.post('/transfers/create', (req, res, next) =>
  createTransferEndpoint(req, res, next)
)
api.post('/transfers/update/:id', (req, res, next) =>
  updateTransferEndpoint(req, res, next)
)
api.post('/transfers/cancel/:id', (req, res, next) =>
  cancelTransferEndpoint(req, res, next)
)

// LOCATIONS

api.post('/locations/create', (req, res, next) =>
  createLocationEndpoint(req, res, next)
)

api.post('/locations/update/:id', (req, res, next) =>
  updateLocationEndpoint(req, res, next)
)

// ORGANIZATIONS

api.post('/organizations/create', (req, res, next) =>
  createOrganizationEndpoint(req, res, next)
)

api.post('/organizations/update/:id', (req, res, next) =>
  updateOrganizationEndpoint(req, res, next)
)

api.get('/organizations/get/:id', (req, res, next) =>
  getOrganizationEndpoint(req, res, next)
)

api.get('/organizations/list', (req, res, next) =>
  listOrganizationsEndpoint(req, res, next)
)

// PRIVATE PROFILES

api.get('/private_profile/get', (req, res, next) =>
  // NOTE: this does not take an id as a param
  // the id is acquired from the authentication token
  getPrivateProfileEndpoint(req, res, next)
)

api.get('/private_profile/update', (req, res, next) =>
  // NOTE: this does not take an id as a param
  // the id is acquired from the authentication token
  updatePrivateProfileEndpoint(req, res, next)
)

// TEMP MIGRATIONS
api.get('/migrate_stops_to_transfers', (req, res, next) =>
  migrateStopsToTransfers(req, res, next)
)
api.get('/migrateRescues', (req, res, next) => migrateRescues(req, res, next))

api.get('/migratePublicProfiles', (req, res, next) =>
  migratePublicProfiles(req, res, next)
)

// TEMP DUPLICATE COLLECTION SCRIPT
api.get('/duplicate_collection', (req, res, next) =>
  duplicateCollectionEndpoint(req, res, next)
)

// TEMP REPAIR STOPS SCRIPT
api.get('/selectStopsForRepair', (req, res, next) =>
  selectStopsForRepair(req, res, next)
)
api.get('/repairStops', (req, res, next) => repairStops(req, res, next))
api.get('/uploadRepairedStops', (req, res, next) =>
  uploadRepairedStops(req, res, next)
)

//

//

//

// We do this to dynamically load only the necessary endpoint code and improve cold start/runtime performance
// Reminder: all imported endpoints must have a file name matching the "name" field, and export a function
// with the name {name}Endpoint. We do this so that we can handle all of the networking logic in the `Endpoint`
// function, and contain all of the logic in a separate function that shares the name of the file.
// If other endpoints therefore want to share that logic (ie the getRescue endpoint needing to use getStop),
// they can import the logic directly without the networking/HTTP logic in the way.
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
