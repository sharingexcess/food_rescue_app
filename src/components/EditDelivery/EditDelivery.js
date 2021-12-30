import React, { useCallback, useEffect, useState } from 'react'
import { updateFieldSuggestions, formFields } from './utils'
import { useFirestore } from 'hooks'
import { Input } from 'components'
import { Spacer, Text } from '@sharingexcess/designsystem'
import { generateUniqueId } from 'helpers'

export function EditDelivery({ handleSubmit, title }) {
  const recipients = useFirestore(
    'organizations',
    useCallback(i => i.type === 'recipient', [])
  )
  const locations = useFirestore(
    'locations',
    useCallback(i => !i.is_deleted, [])
  )
  const [formData, setFormData] = useState({
    // Any field used as an input value must be an empty string
    // others can and should be initialized as null
    organization_name: '',
    organization_id: null,
    location_id: '',
    type: 'delivery',
  })
  const [suggestions, setSuggestions] = useState({
    // these will populate the dropdown suggestions for each input
    organization_name: [],
    organization_id: [],
    location_id: [],
  })

  useEffect(() => {
    async function addIdToFormData() {
      const id = await generateUniqueId('pickups')
      setFormData(data => ({ ...data, id }))
    }
    addIdToFormData()
  }, [])

  useEffect(() => {
    if (formData.organization_id && formData.location_id) {
      handleSubmit(formData)
    }
  }, [formData, handleSubmit])

  function handleChange(e, field) {
    if (field.suggestionQuery) {
      updateFieldSuggestions(
        e.target.value,
        field.id === 'organization_name' ? recipients : locations,
        field,
        suggestions,
        setSuggestions
      )
    }
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  function handleSelect(_e, selected, field) {
    if (field.type !== 'select') {
      setSuggestions({ ...suggestions, [field.id]: null })
    }
    const updated_fields = field.handleSelect(selected)
    updated_fields && setFormData({ ...formData, ...updated_fields })
  }

  function renderFieldInput(field) {
    if (!field.preReq || formData[field.preReq]) {
      if (field.loadSuggestionsOnInit && !formData[field.id]) {
        const updatedSuggestions = updateFieldSuggestions(
          formData[field.preReq],
          field.id === 'organization_name' ? recipients : locations,
          field,
          suggestions,
          setSuggestions
        )
        if (updatedSuggestions && updatedSuggestions.length === 1) {
          handleSelect(null, updatedSuggestions[0], field)
        }
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
    <div id="EditDelivery">
      {title !== '' && (
        <>
          <Spacer height={16} />
          <Text type="section-header" color="white" shadow>
            {title || 'Add a Delivery'}
          </Text>
          <Spacer height={8} />
          <Text type="paragraph" color="white" shadow>
            Choose a partner organization and location to drop off food.
          </Text>
        </>
      )}
      {formFields.map(f => renderFieldInput(f))}
    </div>
  )
}
