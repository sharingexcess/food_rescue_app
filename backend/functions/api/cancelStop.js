const { db, fetchDocument } = require('../../helpers/functions')

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

      const canceled_stop = await db
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
          },
          { merge: true }
        )

      if (type === 'delivery') {
        canceled_stop = await db.collection('stops').doc(stop_id).set(
          {
            percent_of_total_dropped: 0,
          },
          { merge: true }
        )
      }

      response.status(200).send(JSON.stringify(canceled_stop))
      resolve()
    } catch (e) {
      console.error('Caught error:', e)
      response.status(500).send(JSON.stringify(e))
    }
  })
}

exports.cancelStopEndpoint = cancelStopEndpoint
