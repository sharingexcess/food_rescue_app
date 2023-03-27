const { db, COLLECTIONS, generateUniqueId } = require('../../../helpers')
const { isValidOrganizationPayload } = require('./isValidOrganizationPayload')

exports.createOrganization = async ({ name, type, subtype }) => {
  // spell it out above so VSCode can suggest the right args on function calls
  // and combine it into "payload" here so we don't forget one line by accident
  // this also ensures we don't add any stray unexpected properties to the DB record
  const payload = { name, type, subtype }

  // check separately for duplicate orgs (existing orgs with the same name)
  const is_duplicate = await db
    .collection(COLLECTIONS.ORGANIZATIONS)
    .where('name', '==', payload.name)
    .get()
    .then(snapshot => snapshot.size)

  if (is_duplicate) {
    throw new Error('Organization with this name already exists.')
  }

  const is_valid = await isValidOrganizationPayload(payload)

  if (is_valid) {
    const id = await generateUniqueId(COLLECTIONS.ORGANIZATIONS)
    const now = new Date().toISOString()

    const organization = {
      id, // always created server side
      timestamp_created: now, // always created server side
      timestamp_updated: now, // always created server side
      ...payload,
    }

    console.log('Creating organization:', organization)

    await db.collection(COLLECTIONS.ORGANIZATIONS).doc(id).set(organization)

    return organization
  } else {
    throw new Error('Invalid payload')
  }
}
