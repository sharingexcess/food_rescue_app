const moment = require('moment')
const { db, COLLECTIONS } = require('../../../helpers')

exports.listRescues = async (
  {
    type,
    status,
    handler_id,
    date_range_start,
    date_range_end,
    start_after,
    limit = 100,
  },
  options = { shallow: false }
) => {
  const rescues = []

  let rescues_query = db.collection(COLLECTIONS.RESCUES)

  // if provided with a "start_after" id for pagination,
  // we need to get the doc reference for that rescue
  // to properly construct the query
  let start_after_ref
  if (start_after) {
    await db
      .collection(COLLECTIONS.RESCUES)
      .doc(start_after)
      .get()
      .then(doc => {
        start_after_ref = doc
      })
  }

  // apply filters
  if (type) {
    console.log('Applying type filter:', type)
    rescues_query = rescues_query.where('type', '==', type)
  }

  if (date_range_start && date_range_end) {
    const start = moment(date_range_start).startOf('day').toISOString()
    const end = moment(date_range_end).endOf('day').toISOString()
    console.log(`Applying date range filter, start: ${start}, end: ${end}`)
    rescues_query = rescues_query
      .where('timestamp_scheduled', '>=', start)
      .where('timestamp_scheduled', '<=', end)
  }

  // Note: Ryan hates that we have to do this.
  // We use this really, really hacky "null" string check
  // to support querying for rescues with NO HANDLER assigned.
  // A true null value (not the string) does not apply a filter at all.
  if (handler_id === 'null') {
    rescues_query = rescues_query.where('handler_id', '==', null)
  } else if (handler_id) {
    rescues_query = rescues_query.where('handler_id', '==', handler_id)
  }

  if (status) {
    rescues_query = rescues_query.where('status', '==', status)
  }

  // we don't use a limit if a date range is provided to prevent confusion.
  if (limit && !(date_range_start && date_range_start)) {
    rescues_query = rescues_query.limit(parseInt(limit))
  }

  if (start_after) {
    rescues_query = rescues_query
      .orderBy('timestamp_scheduled', 'desc')
      .startAfter(start_after_ref)
  } else {
    rescues_query = rescues_query.orderBy('timestamp_scheduled', 'desc')
  }

  // execute rescues query
  await rescues_query.get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data()
      rescues.push({
        ...data,
        transfers: data.transfer_ids.map(i => null), // populate stops array with correct length
      })
    })
  })

  console.log('Got rescue objects:', rescues)

  if (options.shallow) {
    console.log(
      'Shallow option flag is true, returning without any additional data fetching.'
    )
    return rescues
  }

  // execute query for all stops within rescues, and handler for rescue
  await Promise.all([
    ...rescues.map(rescue =>
      rescue.handler_id
        ? db
            .collection(COLLECTIONS.PUBLIC_PROFILES)
            .doc(rescue.handler_id)
            .get()
            .then(doc => (rescue.handler = doc.data()))
        : null
    ),
    ...rescues.map(rescue =>
      db
        .collection(COLLECTIONS.TRANSFERS)
        .where('rescue_id', '==', rescue.id)
        .get()
        .then(snapshot =>
          snapshot.forEach(doc => {
            const data = doc.data()
            rescue.transfers[
              rescue.transfer_ids.findIndex(i => i === data.id)
            ] = data
          })
        )
    ),
  ])

  // execute query for organization and location for each transfer
  await Promise.all(
    rescues
      .map(rescue => [
        ...rescue.transfers.map(transfer =>
          db
            .collection('organizations')
            .doc(transfer.organization_id)
            .get()
            .then(doc => {
              const org = doc.data()
              // console.log('got org', org)
              transfer.organization = org
            })
        ),
        ...rescue.transfers.map(transfer =>
          db
            .collection('locations')
            .doc(transfer.location_id)
            .get()
            .then(doc => {
              const loc = doc.data()
              // console.log('got loc', loc)
              transfer.location = loc
            })
        ),
      ])
      .flat()
  )

  console.log(
    'returning rescues:',
    rescues.map(i => i.id)
  )

  return rescues
}
