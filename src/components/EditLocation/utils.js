export function initializeFormData(location, callback) {
  callback({
    name: location.name,
    address1: location.address1,
    address2: location.address2,
    city: location.city,
    state: location.state,
    zip_code: location.zip_code,
    is_primary: location.is_primary,
  })
}

export const required_fields = ['name', 'address1', 'city', 'state', 'zip_code']
