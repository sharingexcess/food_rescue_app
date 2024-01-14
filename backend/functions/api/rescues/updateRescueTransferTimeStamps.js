const { db } = require('../../../helpers')

exports.updateRescueTransferTimeStamps = async (request, response) => {
  const { date_range_start, date_range_end } = request.query

  const rescues = await db
    .collection('rescues')
    .where('status', '==', 'completed')
    .where(
      'timestamp_completed',
      '>=',
      new Date(date_range_start).toISOString()
    )
    .where('timestamp_completed', '<=', new Date(date_range_end).toISOString())
    .get()
    .then(snapshot => snapshot.docs.map(doc => doc.data()))

  for (const rescue of rescues) {
    // if rescue is completed then get rescue's timestamp_scheduled and add rescue_scheduled_time to all its transfers

    if (rescue.status === 'completed') {
      const rescue_scheduled_time = rescue.timestamp_scheduled

      const transfers = await db
        .collection('transfers')
        .where('rescue_id', '==', rescue.id)
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.data()))

      for (const transfer of transfers) {
        await db.collection('transfers').doc(transfer.id).update({
          rescue_scheduled_time,
        })
      }
    }
  }
}
