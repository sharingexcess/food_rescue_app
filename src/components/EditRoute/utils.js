import firebase from 'firebase/app'
import { v4 as generateUniqueId } from 'uuid'
import { getCollection } from 'helpers'
import moment from 'moment'

export function createPickup(event, formData, history) {
  event.preventDefault()
  const id = generateUniqueId()
  getCollection('Pickups')
    .doc(id)
    .set({
      id,
      org_id: formData.org_id,
      location_id: formData.location_id,
      time_start: formData.time_start,
      time_end: formData.time_end,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      status: 0,
    })
    .then(() => history.push(`/`))
    .catch(e => console.error('Error writing document: ', e))
}

export function updateFieldSuggestions(
  queryValue,
  drivers,
  field,
  suggestions,
  callback
) {
  if (field.suggestionQuery) {
    const updatedSuggestions = field.suggestionQuery(queryValue, drivers)
    if (
      !suggestions[field.id] ||
      suggestions[field.id].length !== updatedSuggestions.length
    ) {
      callback({ ...suggestions, [field.id]: updatedSuggestions })
      return updatedSuggestions
    }
  }
}
export function addDays(time) {
  return moment(new Date(time))
    .startOf('hour')
    .add(1, 'week')
    .format('yyyy-MM-DDTkk:mm')
}

export function getDefaultStartTime() {
  return moment(new Date())
    .startOf('hour')
    .add(2, 'hour')
    .format('yyyy-MM-DDTkk:mm')
}

export function getDefaultEndTime() {
  return moment(new Date())
    .startOf('hour')
    .add(4, 'hour')
    .format('yyyy-MM-DDTkk:mm')
}

export function getDefaultEndRecurring() {
  return moment(new Date())
    .startOf('hour')
    .add(2, 'week')
    .add(2, 'hour')
    .format('yyyy-MM-DDTkk:mm')
}

// formFields defines the input form fields used on the EditRescue page
// label: the text that will be visible to the user describing each input
// id: the name of the actual data field stored in Firebase
// preReq: the id of another field that must be completed before showing this field
// type: the type of html input that should be used (text, date, etc.)
// suggestionQuery: a function returning the query to run in order to generate type ahead dropdown suggestions
// handleSelect: a function that returns an object defining what fields to update when a dropdown item is selected
// loadSuggestionsOnInit: a boolean defining whether the suggestionQuery should be run before the user enters any input
export const formFields = [
  {
    label: 'Start Time',
    id: 'time_start',
    type: 'datetime-local',
  },
  {
    label: 'End Time',
    id: 'time_end',
    preReq: 'time_start',
    type: 'datetime-local',
  },
  {
    label: 'Select a driver...',
    id: 'driver_name',
    preReq: 'time_end',
    type: 'text',
    suggestionQuery: (name, drivers) =>
      drivers.filter(d => d.name.toLowerCase().startsWith(name.toLowerCase())),
    handleSelect: user => ({
      driver_name: user.name,
      driver_id: user.id,
    }),
  },
]

export const formFieldsRecurring = [
  {
    label: 'Start Time',
    id: 'time_start',
    type: 'datetime-local',
  },
  {
    label: 'End Time',
    id: 'time_end',
    preReq: 'time_start',
    type: 'datetime-local',
  },
  {
    label: 'End Recurring On',
    id: 'end_recurring',
    preReq: 'time_end',
    type: 'datetime-local',
  },
  {
    label: 'Select a driver...',
    id: 'driver_name',
    type: 'text',
    suggestionQuery: (name, drivers) =>
      drivers.filter(d => d.name.toLowerCase().startsWith(name.toLowerCase())),
    handleSelect: user => ({
      driver_name: user.name,
      driver_id: user.id,
    }),
  },
]

export const getExistingRouteData = async route_id => {
  const routes = await getCollection('Routes')
    .get()
    .then(result => result.docs.map(doc => doc.data()))
  const myRoute = routes.find(route => route.id === route_id)
  const driver = myRoute.driver_id
    ? await getCollection('Users')
        .doc(myRoute.driver_id)
        .get()
        .then(result => result.data())
    : {}
  const deliveries = await getCollection('Deliveries')
    .get()
    .then(result => result.docs.map(doc => doc.data()))
  const pickups = await getCollection('Pickups')
    .get()
    .then(result => result.docs.map(doc => doc.data()))
  const locations = await getCollection('Locations')
    .get()
    .then(result => result.docs.map(doc => doc.data()))
  const organizations = await getCollection('Organizations')
    .get()
    .then(result => result.docs.map(doc => doc.data()))

  const newStops = myRoute.stops.map(route_stop => {
    const stopCategory = route_stop.type === 'pickup' ? pickups : deliveries
    const stopData = stopCategory.find(stop => stop.id === route_stop.id)
    // We can get location_id and org_id from this stopData
    const organizationData = organizations.find(
      org => org.id === stopData.org_id
    )
    const locationData = locations.find(loc => loc.id === stopData.location_id)

    return {
      ...route_stop,
      location: locationData,
      location_id: stopData.location_id,
      org: organizationData,
      org_id: stopData.org_id,
      org_name: organizationData.name,
      can_delete: stopData.status !== 9,
      status: stopData.status,
    }
  })

  const routeData = {
    driver: Object.keys(driver).length ? driver : null,
    driver_id: myRoute.driver_id,
    driver_name: driver.name,
    time_start: myRoute.time_start,
    time_end: myRoute.time_end,
    end_recurring: getDefaultEndRecurring(),
    stops: newStops,
    created_at: myRoute.created_at,
    status: myRoute.status,
  }
  return routeData
}

export const getTimeConflictInfo = (
  driver_id,
  time_start,
  time_end,
  routes
) => {
  let checkInfo = { hasConflict: false, conflictRoutes: [] }
  if (!driver_id) {
    return checkInfo
  } else {
    const driverRoutes = routes.filter(
      route =>
        route.driver_id === driver_id &&
        route.status !== 9 &&
        ((moment(route.time_start) <= moment(time_start) &&
          moment(time_start) < moment(route.time_end)) ||
          (moment(route.time_start) >= moment(time_start) &&
            moment(route.time_start) < moment(time_end)))
    )
    if (driverRoutes.length > 0) {
      checkInfo = { hasConflict: true, conflictRoutes: [...driverRoutes] }
    }
    return checkInfo
  }
}
