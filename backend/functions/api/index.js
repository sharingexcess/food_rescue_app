const express = require('express')
const cors = require('cors')

// initialize express server
const api = express()
api.use(cors({ origin: true }))

// define api endpoints
api.get('/', (_request, response) =>
  response.send(
    `Sharing Excess API, ©${new Date().getFullYear()}, All Rights Reserved.`
  )
)
api.get('/rescues', (req, res) => loadEndpoint('rescues', req, res))
api.get('/rescues/:id', (req, res) => loadEndpoint('rescue', req, res))
api.get('/stops', (req, res) => loadEndpoint('stops', req, res))
api.get('/stops/:id', (req, res) => loadEndpoint('stop', req, res))
api.get('/analytics', (req, res) => loadEndpoint('analytics', req, res))
api.get('/impact', (req, res) => loadEndpoint('impact', req, res))
api.post('/calendar/add', (req, res) =>
  loadEndpoint('addCalendarEvent', req, res)
)
api.post('/calendar/delete', (req, res) =>
  loadEndpoint('deleteCalendarEvent', req, res)
)
api.post('/rescues/:id/update', (req, res) =>
  loadEndpoint('updateRescue', req, res)
)
api.post('/stops/:id/create', (req, res) =>
  loadEndpoint('createStop', req, res)
)
api.post('/stops/:id/update', (req, res) =>
  loadEndpoint('updateStop', req, res)
)
api.post('/rescues/:id/cancel', (req, res) =>
  loadEndpoint('cancelRescue', req, res)
)
api.post('/rescues/:id/:type/:stop_id/cancel', (req, res) =>
  loadEndpoint('cancelStop', req, res)
)
api.get('/reports', (req, res) => loadEndpoint('reports', req, res))

api.post('/rescues/:id/create', (req, res) =>
  loadEndpoint('createRescue', req, res)
)
api.get('/organization/:id', (req, res) =>
  loadEndpoint('organization', req, res)
)
api.post('/organization/:id/update', (req, res) =>
  loadEndpoint('updateOrganization', req, res)
)
api.get('/organizations', (req, res) => loadEndpoint('organizations', req, res))
api.post('/location/:id/update', (req, res) =>
  loadEndpoint('updateLocation', req, res)
)
api.post('/location/:id/delete', (req, res) =>
  loadEndpoint('deleteLocation', req, res)
)
api.get('/users', (req, res) => loadEndpoint('users', req, res))
api.get('/user/:id', (req, res) => loadEndpoint('user', req, res))
api.get('/publicProfiles', (req, res) =>
  loadEndpoint('publicProfiles', req, res)
)
api.get('/publicProfiles/:id', (req, res) =>
  loadEndpoint('publicProfile', req, res)
)
api.get('/privateProfiles/:id', (req, res) =>
  loadEndpoint('privateProfile', req, res)
)
api.post('/publicProfile/:id/update', (req, res) =>
  loadEndpoint('updatePublicProfile', req, res)
)
api.post('/privateProfile/:id/update', (req, res) =>
  loadEndpoint('updatePrivateProfile', req, res)
)
api.post('/updateUserPermission/:id', (req, res) =>
  loadEndpoint('updateUserPermission', req, res)
)

api.get('/getCachedDataReports', (req, res) =>
  loadEndpoint('getCachedDataReports', req, res)
)

api.post('/wholesale/rescue/create', (req, res) =>
  loadEndpoint('createWholesaleRescue', req, res)
)

api.post('/wholesale/rescue/:id/update', (req, res) =>
  loadEndpoint('updateWholesaleRescue', req, res)
)

api.post('/wholesale/rescue/:rescue_id/addRecipient', (req, res) =>
  loadEndpoint('addWholesaleRecipient', req, res)
)

api.post('/wholesale/rescue/:rescue_id/updateRecipient/:id', (req, res) =>
  loadEndpoint('updateWholesaleRecipient', req, res)
)

// THIS IS A PROD RESCUE UPDATE SCRIPT, LEAVING IN PLACE FOR NOW BUT DO NOT USE
// api.get('/updateRescueType', (req, res) =>
//   loadEndpoint('updateRescueType', req, res)
// )

// we do this to dynamically load only the necessary endpoint code and improve cold start/runtime performance
function loadEndpoint(name, request, response) {
  const module = require(`./${name}`)
  const endpoint = module[`${name}Endpoint`]
  return endpoint(request, response)
}

// export express server instance
exports.api = api
