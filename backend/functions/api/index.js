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
  duplicateCollectionEndpoint,
} = require('./utilities/duplicateCollection')
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
const { testBackup } = require('./utilities/testBackup')
const { migrateCollection } = require('./utilities/migrateCollection')
const {
  getPublicProfileEndpoint,
  updatePublicProfileEndpoint,
  listPublicProfilesEndpoint,
} = require('./public_profiles/publicProfileEndpoints')
const {
  getCachedDataReportsEndpoint,
} = require('./utilities/getCachedDataReports')

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

// SANITY CHECK ENDPOINT (there to ensure the server is responding at all, no auth)
api.get('/', (_request, response) =>
  response.send(
    `Sharing Excess API, ©${new Date().getFullYear()}, All Rights Reserved.`
  )
)

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

// PUBLIC PROFILES
api.post('/public_profiles/update/:id', (req, res, next) =>
  updatePublicProfileEndpoint(req, res, next)
)

api.get('/public_profiles/get/:id', (req, res, next) =>
  getPublicProfileEndpoint(req, res, next)
)

api.get('/public_profiles/list', (req, res, next) =>
  listPublicProfilesEndpoint(req, res, next)
)

// PRIVATE PROFILES

api.get('/private_profile/get', (req, res, next) =>
  // NOTE: this does not take an id as a param
  // the id is acquired from the authentication token
  getPrivateProfileEndpoint(req, res, next)
)

api.post('/private_profile/update', (req, res, next) =>
  // NOTE: this does not take an id as a param
  // the id is acquired from the authentication token
  updatePrivateProfileEndpoint(req, res, next)
)

// UTILITIES

api.get('/getCachedDataReports', (req, res, next) =>
  getCachedDataReportsEndpoint(req, res, next)
)
api.get('/selectStopsForRepair', (req, res, next) =>
  selectStopsForRepair(req, res, next)
)
api.get('/repairStops', (req, res, next) => repairStops(req, res, next))
api.get('/uploadRepairedStops', (req, res, next) =>
  uploadRepairedStops(req, res, next)
)
api.get('/testBackup', (req, res, next) => testBackup(req, res, next))
api.get('/migrateCollection', (req, res, next) =>
  migrateCollection(req, res, next)
)
api.get('/duplicate_collection', (req, res, next) =>
  duplicateCollectionEndpoint(req, res, next)
)

// THIS IS A PROD RESCUE UPDATE SCRIPT, LEAVING IN PLACE FOR NOW
// BUT READ THE DOCUMENTATION INSIDE THE FILE BEFORE RUNNING THIS
// api.get('/dangerous_manual_db_update_script', (req, res, next) =>
//   loadEndpoint('_dangerousManualDbUpdateScript', req, res, next)
// )

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
