export function initializeFormData(org, callback) {
  callback({
    name: org.name,
    default_contact_name: org.default_contact_name,
    default_contact_email: org.default_contact_email,
    default_contact_phone: org.default_contact_phone,
    org_type: org.org_type,
  })
}
