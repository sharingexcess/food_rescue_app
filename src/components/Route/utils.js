export function generateDirectionsLink(addressObj) {
  const base_url = 'https://www.google.com/maps/dir/?api=1&destination='
  return `${base_url}${addressObj.address1}+${addressObj.city}+${addressObj.state}+${addressObj.zip_code}`
}

export function allFoodDelivered(stops) {
  // This function will only be called after all stops are finished
  console.log('Stops data >>>', stops)
  let finalWeight = 0
  for (let stop of stops) {
    stop.type === 'pickup'
      ? (finalWeight += stop.report.weight)
      : (finalWeight -= stop.report.weight)
  }
  console.log('Final weight >>>', finalWeight)
  return finalWeight === 0
}
