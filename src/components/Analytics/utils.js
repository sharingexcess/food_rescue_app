import moment from 'moment'

export function getDefaultRangeStart() {
  return moment(new Date())
    .startOf('hour')
    .subtract(2, 'weeks')
    .format('yyyy-MM-DDTkk:mm')
}

export function getDefaultRangeEnd() {
  return moment(new Date()).startOf('hour').format('yyyy-MM-DDTkk:mm')
}

export function capitalize(s) {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function sortByRoutesforDriver(array, routes) {
  return array.sort((a, b) =>
    routes.filter(r => r.driver_id === a.id) >
    routes.filter(r => r.driver_id === b.id)
      ? -1
      : 1
  )
}

export function sortByRoutesforOrg(array, routes, pickups, deliveries) {
  return array.sort((a, b) => {
    const all_pickups_a = pickups.filter(
      p => p.org_id === a.id && p.status === 9
    )
    const all_deliveries_a = deliveries.filter(
      de => de.org_id === a.id && de.status === 9
    )
    const a_pickup_ids = all_pickups_a.map(p => p.id)
    const a_delivery_ids = all_deliveries_a.map(de => de.id)
    const a_routes = routes.filter(
      r =>
        r.stops.filter(
          s => a_pickup_ids.includes(s.id) || a_delivery_ids.includes(s.id)
        ).length > 0 && r.status === 9
    )
    const all_pickups_b = pickups.filter(
      p => p.org_id === b.id && p.status === 9
    )
    const all_deliveries_b = deliveries.filter(
      de => de.org_id === b.id && de.status === 9
    )
    const b_pickup_ids = all_pickups_b.map(p => p.id)
    const b_delivery_ids = all_deliveries_b.map(de => de.id)
    const b_routes = routes.filter(
      r =>
        r.stops.filter(
          s => b_pickup_ids.includes(s.id) || b_delivery_ids.includes(s.id)
        ).length > 0 && r.status === 9
    )
    if (a_routes > b_routes) {
      return -1
    } else {
      return 1
    }
  })
}
