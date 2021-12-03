/* eslint-disable */
import { useState } from 'react'
import { Input } from 'components'
import { Button } from '@sharingexcess/designsystem'

export function Caluculator() {
  const [weight, setWeight] = useState(0)
  const [category, setCategory] = useState(0)
  function handleWeightChange(e) {
    setWeight(parseInt(e.target.value))
  }

  function handleCategoryChange(e) {
    setCategory(e.target.value)
  }

  return (
    <div id="Calculator">
      <Input
        type="tel"
        value={weight}
        onChange={handleWeightChange}
        label="Enter weight..."
      ></Input>
      <select value={category} onChange={handleCategoryChange}>
        <option>Select category ...</option>
        <option value="dairy">Dairy</option>
        <option value="bakery">Bakery</option>
        <option value="meat/Fish">Meat/Fish</option>
        <option value="mixed groceries">Mixed Groceries</option>
        <option value="non-perishable">Non-Perishable</option>
        <option value="prepared/Frozen">Prepared/Frozen</option>
        <option value="produce">Produce</option>
        <option value="other">Other</option>
      </select>
      <Button type="primary" color="green" size="large">
        Add Weight to Report
      </Button>
      <Button type="tertiary" color="green" size="medium">
        I'm done
      </Button>
    </div>
  )
}
