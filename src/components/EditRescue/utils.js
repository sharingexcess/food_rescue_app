import firebase from 'firebase/app'
import { v4 as generateUniqueId } from 'uuid'
import { getCollection } from '../../helpers/helpers'

export function createRescue(event, formData, history) {
  event.preventDefault()
  const id = generateUniqueId()
  getCollection('Rescues')
    .doc(id)
    .set({
      id,
      pickup_org_id: formData.pickup_org_id,
      pickup_location_id: formData.pickup_location_id,
      delivery_org_id: formData.delivery_org_id,
      delivery_location_id: formData.delivery_location_id,
      pickup_timestamp: formData.pickup_timestamp,
      delivery_timestamp: formData.delivery_timestamp,
      driver_id: formData.driver_id,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      status: formData.driver_id ? 3 : 0,
    })
    .then(() => history.push(`/rescues/${id}`))
    .catch(e => console.error('Error writing document: ', e))
}

export function updateFieldSuggestions(
  queryValue,
  field,
  suggestions,
  callback
) {
  field.suggestionQuery &&
    field
      .suggestionQuery(queryValue)
      .get()
      .then(querySnapshot => {
        const updatedSuggestions = []
        querySnapshot.forEach(doc => {
          updatedSuggestions.push({ id: doc.id, ...doc.data() })
        })
        console.log(field.id, suggestions[field.id], updatedSuggestions)
        if (
          !suggestions[field.id] ||
          suggestions[field.id].length !== updatedSuggestions.length
        ) {
          callback({ ...suggestions, [field.id]: updatedSuggestions })
        }
      })
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
    label: 'Pickup Organization',
    id: 'pickup_org_name',
    preReq: null,
    type: 'text',
    suggestionQuery: name =>
      getCollection('Organizations')
        .where('name', '>=', name)
        .where('name', '<=', name + '\uf8ff'),
    handleSelect: org => ({
      pickup_org_name: org.name,
      pickup_org_id: org.id,
      delivery_org_name: '',
      delivery_org_id: '',
      pickup_location_id: '',
    }),
    loadSuggestionsOnInit: false,
  },
  {
    label: 'Pickup Location',
    id: 'pickup_location_id',
    preReq: 'pickup_org_id',
    type: 'select',
    suggestionQuery: org_id =>
      getCollection('Organizations').doc(org_id).collection('Locations'),
    handleSelect: loc => (loc ? { pickup_location_id: loc.id } : null),
    loadSuggestionsOnInit: true,
  },
  {
    label: 'Delivery Organization',
    id: 'delivery_org_name',
    preReq: 'pickup_location_id',
    type: 'text',
    suggestionQuery: name =>
      getCollection('Organizations')
        .where('name', '>=', name)
        .where('name', '<=', name + '\uf8ff'),
    handleSelect: org => ({
      delivery_org_name: org.name,
      delivery_org_id: org.id,
      delivery_location_id: '',
    }),
    loadSuggestionsOnInit: false,
  },
  {
    label: 'Delivery Location',
    id: 'delivery_location_id',
    preReq: 'delivery_org_id',
    type: 'select',
    suggestionQuery: org_id =>
      getCollection('Organizations').doc(org_id).collection('Locations'),
    handleSelect: loc => (loc ? { delivery_location_id: loc.id } : null),
    loadSuggestionsOnInit: true,
  },
  {
    label: 'Pickup Time',
    id: 'pickup_timestamp',
    preReq: 'delivery_location_id',
    type: 'datetime-local',
    loadSuggestionsOnInit: false,
  },
  {
    label: 'Delivery Time',
    id: 'delivery_timestamp',
    preReq: 'pickup_timestamp',
    type: 'datetime-local',
    loadSuggestionsOnInit: false,
  },
  {
    label: 'Driver (optional)',
    id: 'driver_name',
    preReq: 'delivery_timestamp',
    type: 'text',
    suggestionQuery: name =>
      getCollection('Users')
        .where('name', '>=', name)
        .where('name', '<=', name + '\uf8ff'),
    handleSelect: user => ({
      driver_name: user.name,
      driver_id: user.id,
    }),
    loadSuggestionsOnInit: false,
  },
]
