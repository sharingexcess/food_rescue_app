const express = require('express')
const cors = require('cors')
const { rescue } = require('./rescue')
const { rescues } = require('./rescues')

const api = express()
api.use(cors({ origin: true }))
api.get('/rescue/:id', rescue)
api.get('/rescues', rescues)
exports.api = api
