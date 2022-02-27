const express = require('express')
const cors = require('cors')
const { rescues } = require('./rescues')
const { rescue } = require('./rescue')
const { stop } = require('./stop')

const api = express()
api.use(cors({ origin: true }))
api.get('/rescues', rescues)
api.get('/rescue/:rescue_id', rescue)
api.get('/stop/:stop_id', stop)
exports.api = api
