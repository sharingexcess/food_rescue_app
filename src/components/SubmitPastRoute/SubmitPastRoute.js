import React, { memo, useEffect, useState } from 'react'
import Header from '../Header/Header'
import { Input } from '../Input/Input'
import { formFields } from './utils'
import './SubmitPastRoute.scss'

export default function SubmitPastRoute() {
  const selectedFormFields = formFields
  const [formData, setFormData] = useState({
    driver_name: '',
    driver_id: null,
    time_start: '',
    time_end: '',
    end_recurring: '',
    stops: [],
  })
  return (
    <>
      <main id="EditRoute">
        <Header text="Submit Past Route" />
        {selectedFormFields.map(field => (
          <Input
            key={field.id}
            element_id={field.id}
            type={field.type}
            label={field.label}
            value={formData[field.id]}
            // onChange={e => handleChange(e, field)}
            // suggestions={suggestions[field.id]}
            // onSuggestionClick={
            //   field.type === 'select'
            //     ? e => handleDropdownSelect(e, field)
            //     : (e, s) => handleSelect(e, s, field)
            // }
            animation={false}
          />
        ))}
        <button>Submit</button>
      </main>
    </>
  )
}
