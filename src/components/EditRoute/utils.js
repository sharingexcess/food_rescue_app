import firebase from 'firebase/app'
import { v4 as generateUniqueId } from 'uuid'
import { getCollection } from '../../helpers/helpers'
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
    label: 'Recurring Type',
    id: 'recurring_type',
    type: 'select',
    handleSelect: type => ({ recurring_type: type }),
    loadSuggestionsOnInit: true,
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
