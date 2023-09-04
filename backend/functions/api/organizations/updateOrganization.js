const { db, COLLECTIONS } = require('../../../helpers')
const {
  isValidLocationPayload,
  isValidOrganizationPayload,
} = require('./isValidOrganizationPayload')

exports.updateOrganization = async ({
  id,
  name,
  type,
  subtype,
  tags = null,
  is_deleted,
  dashboard_access,
}) => {
  // spell it out above so VSCode can suggest the right args on function calls
  // and combine it into "payload" here so we don't forget one line by accident
  // this also ensures we don't add any stray unexpected properties to the DB record
  const payload = { name, type, subtype, tags, is_deleted, dashboard_access }

  const existing_organization = await db
    .collection(COLLECTIONS.ORGANIZATIONS)
    .doc(id)
    .get()
    .then(doc => doc.data())

  if (!existing_organization) {
    throw new Error(`No existing organization found matching id: ${id}`)
  }

  const is_valid = await isValidOrganizationPayload(payload)

  if (is_valid) {
    const now = new Date().toISOString()

    const organization = {
      ...existing_organization,
      ...payload,
      timestamp_updated: now, // always updated server side
      id: existing_organization.id, // always updated server side
    }

    console.log('Updating organization:', organization)

    await db.collection(COLLECTIONS.ORGANIZATIONS).doc(id).set(organization)

    return organization
  } else {
    throw new Error('Invalid payload')
  }
}
