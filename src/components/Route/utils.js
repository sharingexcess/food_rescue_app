export function generateDirectionsLink(addressObj) {
  const base_url = 'https://www.google.com/maps/dir/?api=1&destination='
  return `${base_url}${addressObj.address1}+${addressObj.city}+${addressObj.state}+${addressObj.zip_code}`
}

export function allFoodDelivered(stops) {
  if (stops.length === 0) {
    return false
  }
  let finalWeight = 0
  for (const stop of stops) {
    if (stop.report?.weight) {
      stop.type === 'pickup'
        ? (finalWeight += stop.report.weight)
        : (finalWeight -= stop.report.weight)
    }
  }
  return finalWeight === 0
}

export function areAllStopsCompleted(stops) {
  let completed = true
  for (const s of stops) {
    // if stop is not completed or cancelled
    if (s.status !== 0 && s.status !== 9) {
      completed = false
      break
    }
  }
  return completed
}

export function getNextIncompleteStopIndex(route, stops) {
  if (route.status !== 3) return null
  let index
  for (const [idx, j] of route.stops.entries()) {
    const stop = stops.find(s => j.id === s.id)
    if (![0, 9].includes(stop.status)) {
      index = idx
      break
    }
  }
  return index
}

export function getDeliveryWeight(deliveries, route) {
  const deliveredWeight = deliveries.filter(r => r.route_id === route.id)
  let totalWeight = 0
  for (let i = 0; i < deliveredWeight.length; i++) {
    totalWeight += deliveredWeight[i].report?.weight
      ? deliveredWeight[i].report?.weight
      : 0
  }
  return totalWeight
}
