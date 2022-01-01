/* eslint-disable */
import { useState } from 'react'
import { Input } from 'components'
import { Button, Text, Spacer } from '@sharingexcess/designsystem'
import { useApp } from 'hooks'

export function AddToCategory() {
  const [weight, setWeight] = useState(0)
  const { setModal, modalState } = useApp()

  function handleWeightChange(e) {
    setWeight(parseInt(e.target.value) || 0)
  }

  function handleAddToReport() {
    modalState.setFormData(currentData => ({
      ...currentData,
      [modalState.field]: currentData[modalState.field] + weight,
      impact_data_total_weight: modalState.sumWeight({
        ...currentData,
        [modalState.field]: currentData[modalState.field] + weight,
      }),
    }))
    setModal(false)
  }

  return (
    <div id="AddToCategory">
      <Text type="secondary-header" color="black" align="left">
        Add Weight to{' '}
        {modalState.field.replace('impact_data_', '').replace('_', ' ')}
      </Text>
      <Spacer height={8} />
      <Text type="small" color="grey" align="left">
        Use this tool to add pounds of rescued food without having to do the
        math yourself ;)
      </Text>
      <Input
        type="tel"
        value={weight === 0 ? '' : weight}
        onChange={handleWeightChange}
        label="Enter weight..."
        autoFocus
      ></Input>
      <Spacer />
      <Button
        type="primary"
        color="green"
        size="large"
        handler={handleAddToReport}
        fullWidth
      >
        Add Weight to Report
      </Button>
    </div>
  )
}
