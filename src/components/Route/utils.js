export function generateDirectionsLink(addressObj) {
  const base_url = 'https://www.google.com/maps/dir/?api=1&destination='
  return `${base_url}${addressObj.address1}+${addressObj.city}+${addressObj.state}+${addressObj.zip_code}`
}

export function allFoodDelivered(stops) {
  if (stops.length === 0) {
    return false
  }
  console.log('Stops data >>>', stops)
  let finalWeight = 0
  for (const stop of stops) {
    if (!stop.report) {
      return false
    }
    stop.type === 'pickup'
      ? (finalWeight += stop.report.weight)
      : (finalWeight -= stop.report.weight)
  }
  console.log('Final weight >>>', finalWeight)
  return finalWeight === 0
}
