const { getRetoolCachedData, deleteFile } = require('../../helpers')
const {
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')
const moment = require('moment-timezone')

async function getCachedDataEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log('INVOKING ENDPOINT: getCachedData()')

      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        () => false // only approve requests from retool
      )

      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }

      const data = await getCachedData()

      console.log('Retool Cached File:', data)
      response.status(200).send(JSON.stringify(data))
      resolve()
    } catch (e) {
      console.log('Caught error:', e)
      response.status(500).send(e.toString())
    }
  })
}

async function getCachedData() {
  console.log('running getCachedData')

  const date = moment(new Date()).tz('America/New_York').format('yyyy-MM-DD')
  const path = `retoolCache/${date}.json`
  const destination = './temp.json'

  const data = await getRetoolCachedData(path, destination)
  console.log('Finished Grabbing Data:', data)
  await deleteFile(destination)
  return data
}

exports.getCachedDataEndpoint = getCachedDataEndpoint
