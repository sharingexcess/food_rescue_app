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
api.get('/rescues/:rescue_id', (req, res) => loadEndpoint('rescue', req, res))
api.get('/stops/:stop_id', (req, res) => loadEndpoint('stop', req, res))
api.get('/analytics', (req, res) => loadEndpoint('analytics', req, res))
api.get('/impact', (req, res) => loadEndpoint('impact', req, res))
api.post('/calendar/add', (req, res) =>
  loadEndpoint('add_calendar_event', req, res)
)
api.post('/calendar/delete', (req, res) =>
  loadEndpoint('delete_calendar_event', req, res)
)

// we do this to dynamically load only the necessary endpoint code and improve cold start/runtime performance
function loadEndpoint(name, request, response) {
  const module = require(`./${name}`)
  const endpoint = module[name]
  return endpoint(request, response)
}

// export express server instance
exports.api = api
