const { db } = require('./helpers')
const express = require('express')
const cors = require('cors')

const fix = express()
fix.use(cors({ origin: true }))
fix.get('/', handleFix)
exports.myStats = fix

async function handleFix(request, response) {
  return new Promise(async resolve => {
    const rescues = []
    await db
      .collection('rescues')
      .where('status', '==', 'completed')
      .get()
      .then(snapshot => snapshot.forEach(doc => rescues.push(doc.data())))

    let stops = []
    await db
      .collection('stops')
      .get()
      .then(snapshot => snapshot.forEach(doc => stops.push(doc.data())))
    stops = stops.filter(i => ['completed', 'cancelled'].includes(i.status))

    // response.status(200).send(JSON.stringify(payload))
    resolve()
    return
  })
}

async function updateImpactDataForRescue(rescue) {
  return new Promise(async res => {
    const { stops } = rescue

    const current_load = {
      ...FOOD_CATEGORIES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}), // eslint-disable-line
    }
    for (const stop of stops) {
      if (stop.type === 'pickup') {
        for (const category in current_load) {
          current_load[category] += stop[category]
        }
      } else {
        if (stop.percent_of_total_dropped && stop.status === 'completed') {
          const impact_data = {}
          const percent_dropped = stop.percent_of_total_dropped / 100
          const load_weight = Object.values(current_load).reduce(
            (a, b) => a + b,
            0
          )
          for (const category in current_load) {
            impact_data[category] = Math.round(
              current_load[category] * percent_dropped
            )
            current_load[category] -= impact_data[category]
          }
          impact_data.impact_data_total_weight = Math.round(
            load_weight * percent_dropped
          )
          await setFirestoreData(['stops', stop.id], {
            ...impact_data,
            timestamp_updated: createTimestamp(),
          })
        } else if (stop.status === 'cancelled') {
          const payload = {
            impact_data_total_weight: 0,
            timestamp_updated: createTimestamp(),
          }
          for (const key in current_load) {
            payload[key] = 0
          }
          if (stop.type === 'delivery') {
            payload.percent_of_total_dropped = 0
          }
          await setFirestoreData(['stops', stop.id], payload)
        }
      }
    }
    res()
  })
}

const createTimestamp = d => (d ? new Date(d) : new Date())

async function setFirestoreData(identifier, value) {
  let next = 'doc'
  let query = db.collection(identifier.shift())
  while (identifier.length) {
    if (next === 'doc') {
      query = query.doc(identifier.shift())
      next = 'collection'
    } else {
      query = query.collection(identifier.shift())
      next = 'doc'
    }
  }
  return await query.set(value, { merge: true })
}
