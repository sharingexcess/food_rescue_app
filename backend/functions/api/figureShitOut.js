const { getRescues } = require('./rescues')

async function figureShitOut() {
  const rescues = await getRescues(
    null,
    null,
    null,
    null,
    null,
    1000,
    '2023-03-01',
    '2023-04-01'
  )
  const filtered = rescues.filter(rescue => {
    let has_date_bug = false
    for (const stop of rescue.stops) {
      const stop_day = new Date(stop.timestamp_scheduled_start).getDay()
      const rescue_day = new Date(rescue.timestamp_scheduled_start).getDay()
      if (rescue_day !== stop_day) {
        has_date_bug = true
        break
      }
    }
    return has_date_bug
  })
  console.log(
    filtered.map(rescue => ({
      id: rescue.id,
      timestamp_scheduled_start: rescue.timestamp_scheduled_start.substring(
        0,
        10
      ),
      stops: JSON.stringify(
        rescue.stops.map(stop =>
          stop.timestamp_scheduled_start.substring(0, 10)
        )
      ),
    }))
  )
  console.log(filtered.length, ' / ', rescues.length)
  return
}

async function figureShitOutEndpoint(request, response, next) {
  return new Promise(async resolve => {
    try {
      console.log('running figureShitOut')
      await figureShitOut()
      response.status(200).send('done')
      // use resolve to allow the cloud function to close
      resolve()
    } catch (e) {
      next(e)
    }
  })
}

exports.figureShitOut = figureShitOut
exports.figureShitOutEndpoint = figureShitOutEndpoint
