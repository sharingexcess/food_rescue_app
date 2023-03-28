const {
  db,
  STATUSES,
  authenticateRequest,
  rejectUnauthorizedRequest,
} = require('../../helpers')
const { deleteEvent } = require('./deleteCalendarEvent')

async function cancelRescueEndpoint(request, response, next) {
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

      const rescue = await db
        .collection('rescues')
        .doc(id)
        .get()
        .then(doc => doc.data())

      const requestIsAuthenticated = await authenticateRequest(
        request.get('accessToken'),
        user =>
          user.permission === 'admin' ||
          (rescue.handler_id && user.id === rescue.handler_id)
      )

      if (!requestIsAuthenticated) {
        rejectUnauthorizedRequest(response)
        return
      }

      console.log('Rescue to cancel:', rescue)

      Promise.all([
        // cancel all stops
        ...rescue.transfer_ids.map(stop_id =>
          db
            .collection('stops')
            .doc(stop_id)
            .set(
              {
                status: STATUSES.CANCELLED,
                notes: 'Cancelled automatically because of cancelled rescue',
              },
              { merge: true }
            )
            .then(() => console.log('Successfully cancelled stop:', stop_id))
        ),
        // cancel the rescue itself
        db
          .collection('rescues')
          .doc(id)
          .set(
            {
              status: STATUSES.CANCELLED,
              notes: payload.notes || '',
            },
            { merge: true }
          )
          .then(() => console.log('Successfully cancelled rescue:', rescue.id)),
      ])

      try {
        if (rescue.google_calendar_event_id) {
          await deleteEvent(rescue.google_calendar_event_id)
        }
      } catch (e) {
        console.error('Error cancelling google calendar event:', e)
      }

      console.log('Successfully cancelled rescue.')
      response.status(200).send()
      resolve()
    } catch (e) {
      next(e)
    }
  })
}

exports.cancelRescueEndpoint = cancelRescueEndpoint
