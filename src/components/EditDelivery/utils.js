export function updateFieldSuggestions(
  queryValue,
  data,
  field,
  suggestions,
  callback
) {
  if (field.suggestionQuery) {
    const updatedSuggestions = field.suggestionQuery(queryValue, data)
    if (
      !suggestions[field.id] ||
      suggestions[field.id].length !== updatedSuggestions.length
    ) {
      callback({ ...suggestions, [field.id]: updatedSuggestions })
      return updatedSuggestions
    }
  }
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
    label: 'Recipient Network',
    id: 'org_name',
    preReq: null,
    type: 'text',
    suggestionQuery: (name, organizations) =>
      organizations.filter(o =>
        o.name.toLowerCase().includes(name.toLowerCase())
      ),
    handleSelect: org => ({
      org,
      org_name: org.name,
      org_id: org.id,
      location_id: '',
    }),
    loadSuggestionsOnInit: false,
  },
  {
    label: 'Organization Location',
    id: 'location_id',
    preReq: 'org_id',
    type: 'select',
    suggestionQuery: (org_id, locations) =>
      locations.filter(l => l.org_id === org_id),
    handleSelect: loc => (loc ? { location: loc, location_id: loc.id } : null),
    loadSuggestionsOnInit: true,
  },
]
