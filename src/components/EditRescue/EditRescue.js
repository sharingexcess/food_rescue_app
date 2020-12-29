import React, { memo, useState } from 'react'
import { Input } from '../Input/Input'
import { GoBack } from '../../helpers/components'
import { useHistory } from 'react-router-dom'
import { createRescue, updateFieldSuggestions, formFields } from './utils'
import './EditRescue.scss'

function EditRescue() {
  const history = useHistory()
  const [formData, setFormData] = useState({
    // Any field used as an input value must be an empty string
    // others can and should be initialized as null
    pickup_org_name: '',
    pickup_org_id: null,
    pickup_location_id: '',
    delivery_org_name: '',
    delivery_org_id: null,
    delivery_location_id: '',
    pickup_timestamp: '',
    delivery_timestamp: '',
    driver_name: '',
    driver_id: null,
  })
  const [suggestions, setSuggestions] = useState({
    // these will populate the dropdown suggestions for each input
    pickup_org_name: [],
    pickup_org_id: [],
    pickup_location_id: [],
    delivery_org_name: [],
    delivery_org_id: [],
    delivery_location_id: [],
    driver_name: '',
  })

  function handleChange(e, field) {
    if (field.suggestionQuery) {
      updateFieldSuggestions(e.target.value, field, suggestions, setSuggestions)
    }
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  function handleSelect(e, selected, field) {
    if (field.type !== 'select') {
      setSuggestions({ ...suggestions, [field.id]: null })
    }
    const updated_fields = field.handleSelect(selected)
    updated_fields && setFormData({ ...formData, ...updated_fields })
  }

  function renderFieldInput(field) {
    if (!field.preReq || formData[field.preReq]) {
      if (field.loadSuggestionsOnInit && !formData[field.id]) {
        updateFieldSuggestions(
          formData[field.preReq],
          field,
          suggestions,
          setSuggestions
        )
      }

      function handleDropdownSelect(e) {
        handleSelect(
          e,
          suggestions[field.id].find(s => s.id === e.target.value),
          field
        )
      }

      return (
        <Input
          key={field.id}
          element_id={field.id}
          type={field.type}
          label={field.label}
          value={formData[field.id]}
          onChange={e => handleChange(e, field)}
          suggestions={suggestions[field.id]}
          onSuggestionClick={
            field.type === 'select'
              ? handleDropdownSelect
              : (e, s) => handleSelect(e, s, field)
          }
        />
      )
    }
  }

  return (
    <div id="EditRescue">
      <GoBack label="back to rescues" url="/rescues" />
      <h1>New Rescue</h1>
      <p>Use this form to create a new rescue assignment.</p>
      <form onSubmit={e => createRescue(e, formData, history)}>
        {formFields.map(f => renderFieldInput(f))}
        {formData['delivery_timestamp'] && (
          <button type="submit">create new rescue</button>
        )}
      </form>
    </div>
  )
}

export default memo(EditRescue)
