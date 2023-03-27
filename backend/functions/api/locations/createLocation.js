const { db, COLLECTIONS, generateUniqueId } = require('../../../helpers')
const { isValidLocationPayload } = require('./isValidLocationPayload')

exports.createLocation = async ({
  organization_id,
  address1,
  address2,
  city,
  state,
  zip,
  lat,
  lng,
  notes,
  contact_name,
  contact_email,
  contact_phone,
  hours,
  nickname,
}) => {
  // spell it out above so VSCode can suggest the right args on function calls
  // and combine it into "payload" here so we don't forget one line by accident
  // this also ensures we don't add any stray unexpected properties to the DB record
  const payload = {
    organization_id,
    address1,
    address2,
    city,
    state,
    zip,
    lat,
    lng,
    notes,
    contact_name,
    contact_email,
    contact_phone,
    hours,
    nickname,
  }

  const is_valid = await isValidLocationPayload(payload)

  if (is_valid) {
    const id = await generateUniqueId(COLLECTIONS.LOCATIONS)
    const now = new Date().toISOString()

    const location = {
      id, // always created server side
      timestamp_created: now, // always created server side
      timestamp_updated: now, // always created server side
      ...payload,
    }

    console.log('Creating location:', location)

    await db.collection(COLLECTIONS.LOCATIONS).doc(id).set(location)

    return location
  } else {
    throw new Error('Invalid payload')
  }
}
