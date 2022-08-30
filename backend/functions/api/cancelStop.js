const {
  db,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers/functions')

async function cancelStopEndpoint(request, response) {
  return new Promise(async resolve => {
    try {
      console.log('running cancelStop')
      const { type, stop_id } = request.params
      console.log('Received stop_id:', stop_id)
      console.log('Received type:', type)
      if (!stop_id) {
        response.status(400).send('No id param received in request URL.')
        return
      }

      const payload = JSON.parse(request.body)
      console.log('Received payload:', payload)
      if (!payload) {
        response.status(400).send('No payload received in request body.')
        return
      }

      const stop = await db
        .collection('stops')
        .doc(stop_id)
        .get()
        .then(doc => doc.data())

      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user =>
          user.permission === 'admin' ||
          (stop.handler_id && user.id === stop.handler_id)
      )

      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }

      const rescue = await db
        .collection('rescues')
        .doc(stop.rescue_id)
        .get()
        .then(doc => doc.data())

      // update the rescue to move the cancelled stop to the front
      const updatedStopIds = [
        stop.id,
        ...rescue.stop_ids.filter(id => id !== stop.id),
      ]

      await db
        .collection('rescues')
        .doc(rescue.id)
        .set(
          { stop_ids: updatedStopIds, timestamp_updated: new Date() },
          { merge: true }
        )

      // update the stop itself
      await db
        .collection('stops')
        .doc(stop_id)
        .set(
          {
            status: payload.status,
            notes: payload.notes || '',
            impact_data_dairy: 0,
            impact_data_bakery: 0,
            impact_data_produce: 0,
            impact_data_meat_fish: 0,
            impact_data_non_perishable: 0,
            impact_data_prepared_frozen: 0,
            impact_data_mixed: 0,
            impact_data_other: 0,
            impact_data_total_weight: 0,
            timestamp_updated: new Date(),
          },
          { merge: true }
        )

      if (type === 'delivery') {
        await db.collection('stops').doc(stop_id).set(
          {
            percent_of_total_dropped: 0,
          },
          { merge: true }
        )
      }

      response.status(200).send()
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

exports.cancelStopEndpoint = cancelStopEndpoint
