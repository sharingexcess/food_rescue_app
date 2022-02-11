export function initializeFormData(location, callback) {
  callback({
    address1: location.address1 || '',
    address2: location.address2 || '',
    city: location.city,
    state: location.state,
    zip: location.zip,
    lat: location.lat,
    lng: location.lng,
    contact_name: location.contact_name || '',
    contact_email: location.contact_email || '',
    contact_phone: location.contact_phone || '',
    notes: location.notes || '',
    nickname: location.nickname || '',
<<<<<<< HEAD
<<<<<<< HEAD
    hours: location.hours || [],
=======
    hours: location.hours || {},
>>>>>>> dc31660... Began adding button
=======
    hours: location.hours || [],
>>>>>>> 3daa8b5... Adding Time Windows To Locations
    is_philabundance_partner: location.is_philabundance_partner || '',
  })
}
