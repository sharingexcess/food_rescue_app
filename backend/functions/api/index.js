const express = require('express')
const cors = require('cors')
const { rescues } = require('./rescues')
const { rescue } = require('./rescue')
const { stop } = require('./stop')
const { analytics } = require('./analytics')
const { add_calendar_event } = require('./add_calendar_event')
const { delete_calendar_event } = require('./delete_calendar_event')

// initialize express server
const api = express()
api.use(cors({ origin: true }))

// define api endpoints
api.get('/rescues', rescues)
api.get('/rescues/:rescue_id', rescue)
api.get('/stops/:stop_id', stop)
api.get('/analytics', analytics)
api.post('/calendar/add', add_calendar_event)
api.post('/calendar/delete', delete_calendar_event)

api.get('/', (_request, response) =>
  response.send(
    `Sharing Excess API, ©${new Date().getFullYear()}, All Rights Reserved.`
  )
)

// export express server instance
exports.api = api
