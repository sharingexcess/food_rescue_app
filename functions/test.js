// TODO: delete this file!
const fetch = require('node-fetch')

exports.calculateTotalDistanceFromLocations = async (locations = []) => {
  console.log(
    'Running calculateTotalDistanceFromLocations with input:',
    locations
  )
  const base_url =
    'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial'
  const API_KEY = ''

  let total_distance = 0
  let curr_location = locations.shift()

  while (locations.length) {
    const full_url = `
      ${base_url}&key=${API_KEY}
      &origins=${encodeURIComponent(curr_location)}
      &destinations=${encodeURIComponent(locations[0])}
    `

    const response = await fetch(full_url).then(res => res.json())
    const distance = parseFloat(
      response.rows[0].elements[0].distance.text.split(' ')[0]
    )

    console.log(distance)
    total_distance += distance
    curr_location = locations.shift()
  }

  console.log(total_distance)
  return `${total_distance} miles`
}
