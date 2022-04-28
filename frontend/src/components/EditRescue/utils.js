import { formatTimestamp } from 'helpers'
import moment from 'moment'

export function updateFieldSuggestions(
  queryValue,
  handlers,
  field,
  suggestions,
  callback
) {
  if (field.suggestionQuery) {
    const updatedSuggestions = field.suggestionQuery(queryValue, handlers)
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
    .add(1, 'hour')
    .format('yyyy-MM-DDTkk:mm')
}

export function getDefaultEndTime() {
  return moment(new Date())
    .startOf('hour')
    .add(3, 'hour')
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
    id: 'timestamp_scheduled_start',
    type: 'datetime-local',
  },
  {
    label: 'End Time',
    id: 'timestamp_scheduled_finish',
    type: 'datetime-local',
    preReq: 'timestamp_scheduled_start',
  },
  {
    label: 'Select a driver...',
    id: 'handler_name',
    preReq: 'timestamp_scheduled_start',
    type: 'text',
    suggestionQuery: (name, handlers) =>
      handlers.filter(d => d.name.toLowerCase().startsWith(name.toLowerCase())),
    handleSelect: user => ({
      handler_name: user.name,
      handler_id: user.id,
    }),
  },
  {
    label: 'This is a direct link rescue',
    id: 'is_direct_link',
    type: 'checkbox',
  },
]

export const parseExistingRescue = async rescue => {
  if (!rescue) return null
  const rescue_data = {
    handler: Object.keys(rescue.handler).length ? rescue.handler : null,
    handler_id: rescue.handler.id,
    handler_name: rescue.handler.name || null,
    timestamp_scheduled_start: formatTimestamp(
      rescue.timestamp_scheduled_start,
      'yyyy-MM-DDTHH:mm'
    ),
    timestamp_scheduled_finish: formatTimestamp(
      rescue.timestamp_scheduled_finish,
      'yyyy-MM-DDTHH:mm'
    ),
    stops: rescue.stops,
    status: rescue.status,
    google_calendar_event_id: rescue.google_calendar_event_id,
  }
  return rescue_data
}
