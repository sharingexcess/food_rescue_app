export function initializeFormData(location, callback) {
  callback({
    name: location.name,
    contact_name: location.contact_name ? location.contact_name : '',
    contact_phone: location.contact_phone ? location.contact_phone : '',
    secondary_contact_phone: location.secondary_contact_phone
      ? location.secondary_contact_phone
      : '',
    address1: location.address1,
    address2: location.address2,
    city: location.city,
    state: location.state,
    zip_code: location.zip_code,
    lat: location.lat,
    lng: location.lng,
    upon_arrival_instructions: location.upon_arrival_instructions
      ? location.upon_arrival_instructions
      : '',
    is_philabundance_partner: location.is_philabundance_partner
      ? location.is_philabundance_partner
      : '',
  })
}

export const required_fields = ['name', 'address1', 'city', 'state', 'zip_code']
