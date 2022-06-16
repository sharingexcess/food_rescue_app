// update firebase (cancel rescue)
// update all stops (cancel stops)
// delete calendar
// return status code
const { db } = require('../../helpers')

async function cancelRescueEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log('running cancelRescue')
      const { id } = request.params
      console.log('Received id:', id)
      if (!id) {
        response.status(400).send('No id param received in request URL.')
        return
      }
      const payload = JSON.parse(request.body)
      console.log('Received payload:', payload)
      if (!payload) {
        response.status(400).send('No payload received in request body.')
        return
      }
      const canceled_rescue = await db
        .collection('rescues')
        .doc(id)
        .set(
          {
            status: payload.status,
            notes: payload.notes || '',
          },
          { merge: true }
        )
      response.status(200).send(JSON.stringify(canceled_rescue))
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

exports.cancelRescueEndpoint = cancelRescueEndpoint
