import React, { useState } from 'react'

export default function StatesDropDown() {
  const [states] = useState([
    {
      name: 'Test',
      abbreviation: 'TS'
    }
  ]);
  return (
    <select>
   {states.map(state => (
        <option
        key={state.abbreviation}
        value={state.abbreviation}>
        {state.name} ({state.abbreviation})
                </option>
            ))}
        </select>
    )
    
}