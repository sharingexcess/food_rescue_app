/* eslint-disable */
import { useState } from 'react'
import { Input } from 'components'
import { Button, Text, Spacer } from '@sharingexcess/designsystem'
import { useApp } from 'hooks'

export function Caluculator() {
  const [weight, setWeight] = useState(0)
  const [category, setCategory] = useState(0)
  const { setModal, modalState } = useApp()
  console.log(modalState)
  function handleWeightChange(e) {
    setWeight(parseInt(e.target.value) || 0)
  }

  function handleCategoryChange(e) {
    setCategory(e.target.value)
  }

  function handleAddToReport() {
    modalState.setFormData(currentData => ({
      ...currentData,
      [category]: currentData[category] + weight,
    }))
    setWeight(0)
    setCategory('')
  }

  return (
    <div id="Calculator">
      <Text type="subheader" color="black" align="center">
        Input weight and select category of each box.
      </Text>
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
      <Spacer />
      <Button
        type="primary"
        color="green"
        size="large"
        handler={handleAddToReport}
      >
        Add Weight to Report
      </Button>
      <Spacer />
      <Button
        type="tertiary"
        color="green"
        size="medium"
        handler={() => setModal(false)}
      >
        I'm done
      </Button>
    </div>
  )
}
