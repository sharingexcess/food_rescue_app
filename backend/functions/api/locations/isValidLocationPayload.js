const { isExistingDbRecord, COLLECTIONS } = require('../../../helpers')

/*
Example Valid Payload:
{
  organization_id: 'test',
  address1: 'test',
  address2: 'test',
  city: 'test,
  state: 'test',
  zip: 'test',
  lat: 0,
  lng: 0,
  notes: '',
}
*/

exports.isValidLocationPayload = async ({
  organization_id,
  address1,
  address2,
  city,
  state,
  zip,
  lat,
  lng,
  notes,
}) => {
  // check that all ids included in payload are valid connections to other db objects
  if (!(await isExistingDbRecord(organization_id, COLLECTIONS.ORGANIZATIONS))) {
    return false
  }

  // check that all parts of address are strings
  const address = { address1, address2, city, state, zip }
  for (const property in address) {
    if (!address[property] || typeof address[property] !== 'string') {
      console.log(
        `Invalid ${property}, value is: "${
          address[property]
        }", type is ${typeof address[property]}. Rejecting.`
      )
    }
  }

  const map_location = { lat, lng }
  for (const property in map_location) {
    if (!map_location[property] || typeof map_location[property] !== 'number') {
      console.log(
        `Invalid ${property}, value is: "${
          map_location[property]
        }", type is ${typeof map_location[property]}. Rejecting.`
      )
    }
  }

  // check that notes are either a string, or falsey.
  if (notes && typeof notes !== 'string') {
    console.log(
      `Invalid notes, value is: "${notes}", type is ${typeof notes}. Rejecting.`
    )
    return false
  }

  return true
}
