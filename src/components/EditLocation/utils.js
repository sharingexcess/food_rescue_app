import { getCollection } from '../../helpers/helpers'
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
    time_open: location.time_open ? location.time_open : '',
    time_close: location.time_close ? location.time_close : '',
    receive_start: location.receive_start ? location.receive_start : '',
    receive_end: location.receive_end ? location.receive_end : '',
  })
}

export async function handleDeleteLocation(locationId) {
  let canDelete = true
  let routesOfLocation = []
  const deliveries = await getCollection('Deliveries')
    .get()
    .then(res => res.docs.map(doc => doc.data()))
  const pickups = await getCollection('Pickups')
    .get()
    .then(res => res.docs.map(doc => doc.data()))
  const deliveriesWithLocationId = deliveries.filter(
    delivery => delivery.location_id === locationId
  )
  const pickupsWithLocationId = pickups.filter(
    pickup => pickup.location_id === locationId
  )
  // Only remove the location if the route is not started or already complete
  for (let stop of deliveriesWithLocationId) {
    const route = await getCollection('Routes')
      .doc(stop.route_id)
      .get()
      .then(result => result.data())
    if (route.status !== 1 || route.status !== 9) {
      canDelete = false
    }
    routesOfLocation.push(route)
  }
  for (let stop of pickupsWithLocationId) {
    const route = await getCollection('Routes')
      .doc(stop.route_id)
      .get()
      .then(result => result.data())
    routesOfLocation.push(route)
  }

  return {
    canDelete,
    locationRoutes: routesOfLocation,
    locationDeliveries: deliveriesWithLocationId,
    locationPickups: pickupsWithLocationId,
  }
}

export const required_fields = ['name', 'address1', 'city', 'state', 'zip_code']
