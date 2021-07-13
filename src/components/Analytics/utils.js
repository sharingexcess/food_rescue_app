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

export function sortByRoutes(array, routes) {
  return array.sort((a, b) =>
    routes.filter(r => r.driver_id === a.id) >
    routes.filter(r => r.driver_id === b.id)
      ? -1
      : 1
  )
}

export function capitalize(s) {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function calculateAllWeights(org, pickups, deliveries) {
  return [
    ...pickups.filter(p => p.org_id === org.id && p.status === 9),
    ...deliveries.filter(d => d.org_id === org.id && d.status === 9),
  ]
    .map(stop => stop.report.weight || 0)
    .reduce((a, b) => a + b, 0)
}
