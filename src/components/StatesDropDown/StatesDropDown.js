import React, { useState } from 'react'
import { usStates } from './usstates'
import './StatesDropDown.scss'
export default function StatesDropDown({
  element_id,
  value,
  onChange,
  animation = true,
}) {
  const [states] = useState(usStates)

  return (
    <div className={`Input ${animation ? 'animation' : ''} select`}>
      <label className="focused">States*</label>
      <select id={element_id} onChange={onChange}>
        {states.map(state => {
          if (value === state.abbreviation) {
            return (
              <option
                key={state.abbreviation}
                value={state.abbreviation}
                selected
              >
                {state.name} ({state.abbreviation})
              </option>
            )
          }
          return (
            <option key={state.abbreviation} value={state.abbreviation}>
              {state.name} ({state.abbreviation})
            </option>
          )
        })}
      </select>
    </div>
  )
}
