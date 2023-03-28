const { getRetoolCachedData, deleteFile } = require('../../../helpers')
const {
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../../helpers')
const admin = require('firebase-admin')
exports.db = admin.firestore()
const moment = require('moment-timezone')

async function getCachedDataReportsEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log('INVOKING ENDPOINT: getCachedData()')

      // MAKING THIS ENDPOINT TEMPORARILY PUBLIC
      // const requestIsAuthenticated = await authenticateRequest(
      //   request.get('accessToken'),
      //   () => false // only approve requests from retool
      // )

      // if (!requestIsAuthenticated) {
      //   rejectUnauthorizedRequest(response)
      //   return
      // }

      const date = moment(new Date())
        .tz('America/New_York')
        .format('yyyy-MM-DD')
      const path = `retoolCache/${date}.json`

      console.log('Reading File')
      const file = admin.storage().bucket().file(path).createReadStream()
      console.log('Concat Data')
      let buf = ''
      file
        .on('data', d => (buf += d))
        .on('end', () => {
          console.log('Cached Data:\n', buf)
          console.log('End')
          response.status(200).send(buf)
          resolve()
        })
    } catch (e) {
      console.log('Caught error:', e)
      response.status(500).send(e.toString())
    }
  })
}

exports.getCachedDataReportsEndpoint = getCachedDataReportsEndpoint
