const { google } = require('googleapis')
const sheets = google.sheets('v4')
const is_prod = process.env.GCLOUD_PROJECT === 'sharing-excess-prod'
const spreadsheetId = is_prod
  ? '1wmcOySR3EhHezgFn0o3suf7RZFDh62secue3jpbPK4Q'
  : '16bn0SYmKu7YnTI1yB5NiMzHhq3E0ZkDzCnfeh0v1AeI'
const serviceAccountKey = is_prod
  ? './serviceAccountProd.json'
  : './serviceAccountDev.json'
const serviceAccount = require(serviceAccountKey)
const moment = require('moment-timezone')
const { db } = require('./helpers')

const jwtClient = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const jwtAuthPromise = jwtClient.authorize()

exports.writeToGoogleSheets = async () => {
  console.log('Spreadsheet ID:', spreadsheetId)
  console.log('is_prod?', is_prod, process.env.GCLOUD_PROJECT)

  // fetch all rescues from db
  const rescues = []
  await db
    .collection('rescues')
    .where('status', '==', 'completed')
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        rescues.push(doc.data())
      })
    })

  // sort rescues by start time
  rescues.sort(
    (a, b) =>
      a.timestamp_scheduled_start.toDate().getTime() -
      b.timestamp_scheduled_start.toDate().getTime()
  )
  console.log('found', rescues.length, 'rescues')

  // fetch all stops from db
  const stops = []
  await db
    .collection('stops')
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        stops.push(doc.data())
      })
    })

  console.log('found', stops.length, 'stops')

  // fetch all organizations from db
  const organizations = []
  await db
    .collection('organizations')
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        organizations.push(doc.data())
      })
    })

  console.log('found', organizations.length, 'organizations')

  // fetch all locations from db
  const locations = []
  await db
    .collection('locations')
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        locations.push(doc.data())
      })
    })

  console.log('found', locations.length, 'locations')

  // fetch all users from db
  const users = []
  await db
    .collection('users')
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        users.push(doc.data())
      })
    })

  console.log('found', users.length, 'users')

  // convert rescues into flattened spreadsheet rows
  // and replace unreadable IDs and data with data
  // gathered from other db tables
  const rescue_rows = []
  const pickup_rows = []
  const delivery_rows = []

  for (const rescue of rescues) {
    // format all timestamps as readable strings
    console.log('rescue:', JSON.stringify(rescue))
    for (const key in rescue) {
      if (key.includes('timestamp_') && rescue[key]) {
        if (!rescue.total_time)
          rescue.total_time = differenceInTime(
            rescue.timestamp_logged_start,
            rescue.timestamp_logged_finish
          )
        rescue[key] = moment(rescue[key].toDate())
          .tz('America/New_York')
          .format('dddd, MM/DD/YY, hh:mma')
      }
    }
    // add the handler's name to the rescue
    if (rescue.handler_id) {
      const handler = users.find(i => i.id === rescue.handler_id)
      console.log('handler:', JSON.stringify(handler))
      rescue.handler_name = handler.name
    } else console.log('No handler_id in rescue, skipping...')

    // map over all stops on the route to get organization and location info
    // and impact data numbers
    if (rescue.stop_ids) {
      const rescue_stops = []
      for (const stop_id of rescue.stop_ids) {
        console.log('looking for stop:', stop_id)
        const stop = stops.find(i => i.id === stop_id)
        console.log('stop:', JSON.stringify(stop))
        if (!stop) {
          console.log('Could not find stop matching id:', stop_id)
          continue
        }
        // get organization name for stop
        const organization = organizations.find(
          i => i.id === stop.organization_id
        )
        console.log('stop organization:', JSON.stringify(organization))
        stop.organization = organization
        // get location address for stop
        const location = locations.find(i => i.id === stop.location_id)
        console.log('stop location:', JSON.stringify(location))
        stop.location = location
        rescue_stops.push(stop)
      }
      // map the stops array to a flattened and readable string
      rescue.stops = rescue_stops
        .map(s => `${s.organization.name} (${s.location.address1})`)
        .join(', ')

      for (const s of rescue_stops) {
        for (const key in s) {
          if (key.includes('timestamp_') && s[key]) {
            s[key] = moment(s[key].toDate())
              .tz('America/New_York')
              .format('dddd, MM/DD/YY, hh:mma')
          }
        }
        const handler = users.find(i => i.id === s.handler_id) || {}
        const organization =
          organizations.find(i => i.id === s.organization_id) || {}
        const location = locations.find(i => i.id === s.location_id) || {}
        const address = `${location.address1}${
          location.address2 ? ', ' + location.address2 : ''
        }, ${location.city}, ${location.state}, ${location.zip}`

        const row = [
          s.id,
          s.rescue_id,
          handler.name || '',
          organization.name || '',
          address || '',
          organization.subtype || '',
          s.timestamp_scheduled_start || '',
          s.timestamp_scheduled_finish || '',
          s.timestamp_logged_start || '',
          s.timestamp_logged_finish || '',
          s.impact_data_dairy || 0,
          s.impact_data_bakery || 0,
          s.impact_data_produce || 0,
          s.impact_data_meat_fish || 0,
          s.impact_data_non_perishable || 0,
          s.impact_data_prepared_frozen || 0,
          s.impact_data_mixed || 0,
          s.impact_data_other || 0,
          s.impact_data_total_weight || 0,
          s.notes || '',
        ]
        if (s.type === 'pickup') {
          console.log('COMPLETE PICKUP ROW:', row)
          pickup_rows.push(row)
        } else {
          console.log('COMPLETE DELIVERY ROW:', row)
          delivery_rows.push(row)
        }
      }

      // calculate impact data for route
      const IMPACT_DATA_CATEGORIES = [
        'impact_data_dairy',
        'impact_data_bakery',
        'impact_data_produce',
        'impact_data_meat_fish',
        'impact_data_non_perishable',
        'impact_data_prepared_frozen',
        'impact_data_mixed',
        'impact_data_other',
        'impact_data_total_weight',
      ]
      const deliveries = rescue_stops.filter(s => s.type === 'delivery')
      for (const category of IMPACT_DATA_CATEGORIES) {
        rescue[category] = deliveries.reduce(
          (total, currDelivery) => total + currDelivery[category],
          0
        )
      }
    }

    console.log('COMPLETE RESCUE:', JSON.stringify(rescue))

    // map completed rescue into array in order of spreadsheet columns
    const row = [
      rescue.id || '',
      rescue.handler_name || '',
      rescue.timestamp_scheduled_start || '',
      rescue.stops || '',
      rescue.status || '',
      rescue.impact_data_dairy || 0,
      rescue.impact_data_bakery || 0,
      rescue.impact_data_produce || 0,
      rescue.impact_data_meat_fish || 0,
      rescue.impact_data_non_perishable || 0,
      rescue.impact_data_prepared_frozen || 0,
      rescue.impact_data_mixed || 0,
      rescue.impact_data_other || 0,
      rescue.impact_data_total_weight || 0,
      rescue.notes || '',
      rescue.is_direct_link || '',
      rescue.timestamp_scheduled_finish || '',
      rescue.timestamp_logged_start || '',
      rescue.timestamp_logged_finish || '',
      rescue.total_time || '',
    ]
    console.log('COMPLETE ROW:', JSON.stringify(row))
    rescue_rows.push(row)
  }

  const rescue_headers = [
    'Rescue ID',
    'Handler',
    'Scheduled Start',
    'Stops',
    'Status',
    'Pounds Rescued (dairy)',
    'Pounds Rescued (bakery)',
    'Pounds Rescued (produce)',
    'Pounds Rescued (meat/fish)',
    'Pounds Rescued (non-perishable)',
    'Pounds Rescued (prepared/frozen)',
    'Pounds Rescued (mixed)',
    'Pounds Rescued (other)',
    'Pounds Rescued (total)',
    'Notes',
    'Direct Link',
    'Scheduled Finish',
    'Logged Start',
    'Logged Finish',
    'Total Time',
  ]
  const columns = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ]

  await jwtAuthPromise

  const rescueHeadersRange = `Rescues!A1:${columns[rescue_headers.length - 1]}1`
  console.log('writing rescue headers to range:', rescueHeadersRange)
  await sheets.spreadsheets.values.update(
    {
      auth: jwtClient,
      spreadsheetId: spreadsheetId,
      range: rescueHeadersRange,
      valueInputOption: 'RAW',
      requestBody: { values: [rescue_headers] },
    },
    {}
  )

  let current_row = 2
  while (rescue_rows.length) {
    const body = rescue_rows.splice(0, Math.min(400, rescue_rows.length))
    const range = `Rescues!A${current_row}:${
      columns[rescue_headers.length - 1]
    }${current_row + body.length}`
    await sheets.spreadsheets.values.update(
      {
        auth: jwtClient,
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        requestBody: { values: body },
      },
      {}
    )
    current_row += body.length
  }

  const pickup_headers = [
    'Pickup ID',
    'Rescue ID',
    'Handler',
    'Donor',
    'Location',
    'Donor Type',
    'Scheduled Start',
    'Scheduled Finish',
    'Logged Start',
    'Logged Finish',
    'Pounds Rescued (dairy)',
    'Pounds Rescued (bakery)',
    'Pounds Rescued (produce)',
    'Pounds Rescued (meat/fish)',
    'Pounds Rescued (non-perishable)',
    'Pounds Rescued (prepared/frozen)',
    'Pounds Rescued (mixed)',
    'Pounds Rescued (other)',
    'Pounds Rescued (total)',
    'Notes',
  ]

  const pickupHeadersRange = `Pickups!A1:${columns[pickup_headers.length - 1]}1`
  console.log('writing rescue headers to range:', pickupHeadersRange)
  await sheets.spreadsheets.values.update(
    {
      auth: jwtClient,
      spreadsheetId: spreadsheetId,
      range: pickupHeadersRange,
      valueInputOption: 'RAW',
      requestBody: { values: [pickup_headers] },
    },
    {}
  )

  current_row = 2
  while (pickup_rows.length) {
    const body = pickup_rows.splice(0, Math.min(400, pickup_rows.length))
    const range = `Pickups!A${current_row}:${
      columns[pickup_headers.length - 1]
    }${current_row + body.length}`
    await sheets.spreadsheets.values.update(
      {
        auth: jwtClient,
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        requestBody: { values: body },
      },
      {}
    )
    current_row += body.length
  }

  const delivery_headers = [
    'Delivery ID',
    'Rescue ID',
    'Handler',
    'Recipient',
    'Location',
    'Recipient Type',
    'Scheduled Start',
    'Scheduled Finish',
    'Logged Start',
    'Logged Finish',
    'Pounds Rescued (dairy)',
    'Pounds Rescued (bakery)',
    'Pounds Rescued (produce)',
    'Pounds Rescued (meat/fish)',
    'Pounds Rescued (non-perishable)',
    'Pounds Rescued (prepared/frozen)',
    'Pounds Rescued (mixed)',
    'Pounds Rescued (other)',
    'Pounds Rescued (total)',
    'Notes',
  ]

  const deliveryHeadersRange = `Deliveries!A1:${
    columns[delivery_headers.length - 1]
  }1`
  console.log('writing rescue headers to range:', deliveryHeadersRange)
  await sheets.spreadsheets.values.update(
    {
      auth: jwtClient,
      spreadsheetId: spreadsheetId,
      range: deliveryHeadersRange,
      valueInputOption: 'RAW',
      requestBody: { values: [delivery_headers] },
    },
    {}
  )

  current_row = 2
  while (delivery_rows.length) {
    const body = delivery_rows.splice(0, Math.min(400, delivery_rows.length))
    const range = `Deliveries!A${current_row}:${
      columns[delivery_headers.length - 1]
    }${current_row + body.length}`
    await sheets.spreadsheets.values.update(
      {
        auth: jwtClient,
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        requestBody: { values: body },
      },
      {}
    )
    current_row += body.length
  }
}

function differenceInTime(dateStarted, dateEnded) {
  const totalTimeSecs =
    (dateEnded.toDate().getTime() - dateStarted.toDate().getTime()) / 1000

  const h = Math.floor(totalTimeSecs / 3600)
  const m = Math.floor((totalTimeSecs % 3600) / 60)

  return `${h} hours, ${m} minutes`
}
