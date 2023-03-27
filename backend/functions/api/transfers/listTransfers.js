const moment = require('moment')
const {
  COLLECTIONS,
  db,
  formatDocumentTimestamps,
} = require('../../../helpers')
const { getRescue } = require('../rescue')

exports.listTransfers = async (
  {
    type,
    date_range_start,
    date_range_end,
    status,
    rescue_id,
    handler_id,
    organization_id,
    organization_subtype,
    start_after,
    limit,
    organization_tag,
    rescue_type,
  },
  options = { shallow: false }
) => {
  console.log('Running listTransfers with params:', {
    type,
    date_range_start,
    date_range_end,
    status,
    rescue_id,
    handler_id,
    organization_id,
    organization_subtype,
    start_after,
    limit,
    organization_tag,
    rescue_type,
  })

  let transfers = []

  let transfers_query = db.collection(COLLECTIONS.TRANSFERS)

  let start_after_ref
  if (start_after) {
    await db
      .collection(COLLECTIONS.TRANSFERS)
      .doc(start_after)
      .get()
      .then(doc => {
        start_after_ref = doc
      })
  }

  // apply filters

  if (date_range_start) {
    const start = moment(date_range_start).startOf('day').toISOString()
    console.log('Applying date_range_start:', start)
    transfers_query = transfers_query.where('timestamp_completed', '>=', start)
  }

  if (date_range_end) {
    const end = moment(date_range_end).endOf('day').toISOString()
    console.log('Applying date_range_end:', end)
    transfers_query = transfers_query.where('timestamp_completed', '<=', end)
  }

  if (type) {
    transfers_query = transfers_query.where('type', '==', type)
  }

  if (rescue_id) {
    transfers_query = transfers_query.where('rescue_id', '==', rescue_id)
  }

  if (handler_id) {
    transfers_query = transfers_query.where('handler_id', '==', handler_id)
  }

  if (status) {
    transfers_query = transfers_query.where('status', '==', status)
  }

  if (organization_id) {
    transfers_query = transfers_query.where(
      'organization_id',
      '==',
      organization_id
    )
  }

  if (limit) {
    transfers_query = transfers_query.limit(parseInt(limit))
  }

  if (start_after) {
    transfers_query = transfers_query
      .orderBy('timestamp_completed', 'desc')
      .startAfter(start_after_ref)
  } else {
    transfers_query = transfers_query.orderBy('timestamp_completed', 'desc')
  }

  // execute transfers query

  await transfers_query.get().then(snapshot => {
    snapshot.forEach(doc => transfers.push(doc.data()))
  })

  console.log('Got transfers:', transfers)

  if (options.shallow) {
    console.log(
      'Shallow option flag is true, returning without any additional data fetching.'
    )
    return transfers
  }

  // execute query for organization and location for each transfer

  await Promise.all(
    transfers
      .map(transfer => [
        transfer.handler_id
          ? db
              .collection('public_profiles')
              .doc(transfer.handler_id)
              .get()
              .then(doc => {
                const handler = formatDocumentTimestamps(doc.data())
                transfer.handler = handler
              })
          : new Promise(res => {
              transfer.handler = null
              res()
            }),
        db
          .collection('organizations')
          .doc(transfer.organization_id)
          .get()
          .then(doc => {
            const org = formatDocumentTimestamps(doc.data())
            transfer.organization = org
          }),
        db
          .collection('locations')
          .doc(transfer.location_id)
          .get()
          .then(doc => {
            const loc = formatDocumentTimestamps(doc.data())
            transfer.location = loc
          }),
      ])
      .flat()
  )

  if (organization_tag) {
    transfers = transfers.filter(transfer => {
      return transfer.organization.tags?.includes(organization_tag)
    })
  }

  if (organization_subtype) {
    transfers = transfers.filter(transfer => {
      return transfer.organization.subtype === organization_subtype
    })
  }

  if (rescue_type) {
    const filtered = []
    for (const transfer of transfers) {
      const rescue = await getRescue(transfer.rescue_id, { shallow: true })
      if (rescue.type === rescue_type) filtered.push(transfer)
    }
    transfers = filtered
  }

  console.log(
    'returning transfers:',
    transfers.map(i => i.id)
  )
  return transfers
}
