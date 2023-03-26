const { db, COLLECTIONS } = require('../../../helpers')
const { isValidLocationPayload } = require('./isValidLocationPayload')

exports.updateLocation = async ({
  id,
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
  is_deleted,
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
    is_deleted,
  }

  const existing_location = await db
    .collection(COLLECTIONS.LOCATIONS)
    .doc(id)
    .get()
    .then(doc => doc.data())

  if (!existing_location) {
    throw new Error(`No existing location found matching id: ${id}`)
  }

  const is_valid = await isValidLocationPayload(payload)

  if (is_valid) {
    const now = new Date().toISOString()

    const location = {
      ...existing_location,
      ...payload,
      timestamp_updated: now, // always updated server side
      id: existing_location.id, // always updated server side
    }

    console.log('Updating location:', location)

    await db.collection(COLLECTIONS.LOCATIONS).doc(id).set(location)

    return location
  } else {
    throw new Error('Invalid payload')
  }
}
