/* eslint-disable */
import { useState } from 'react'
import { Input } from 'components'
import {
  Button,
  Text,
  Spacer,
  FlexContainer,
} from '@sharingexcess/designsystem'
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
      <Text id="AddToCategory-weight" type="primary-header" align="center">
        {weight}
      </Text>
      <FlexContainer>
        <Button
          type="tertiary"
          color="black"
          handler={() => setWeight(parseInt(`${weight}1`))}
        >
          1
        </Button>
        <Button
          type="tertiary"
          color="black"
          handler={() => setWeight(parseInt(`${weight}2`))}
        >
          2
        </Button>
        <Button
          type="tertiary"
          color="black"
          handler={() => setWeight(parseInt(`${weight}3`))}
        >
          3
        </Button>
      </FlexContainer>
      <Spacer height={8} />
      <FlexContainer>
        <Button
          type="tertiary"
          color="black"
          handler={() => setWeight(parseInt(`${weight}4`))}
        >
          4
        </Button>
        <Button
          type="tertiary"
          color="black"
          handler={() => setWeight(parseInt(`${weight}5`))}
        >
          5
        </Button>
        <Button
          type="tertiary"
          color="black"
          handler={() => setWeight(parseInt(`${weight}6`))}
        >
          6
        </Button>
      </FlexContainer>
      <Spacer height={8} />
      <FlexContainer>
        <Button
          type="tertiary"
          color="black"
          handler={() => setWeight(parseInt(`${weight}7`))}
        >
          7
        </Button>
        <Button
          type="tertiary"
          color="black"
          handler={() => setWeight(parseInt(`${weight}8`))}
        >
          8
        </Button>
        <Button
          type="tertiary"
          color="black"
          handler={() => setWeight(parseInt(`${weight}9`))}
        >
          9
        </Button>
      </FlexContainer>
      <Spacer height={8} />
      <FlexContainer>
        <Button type="tertiary" color="black" handler={() => setWeight('')}>
          X
        </Button>
        <Button
          type="tertiary"
          color="black"
          handler={() => setWeight(parseInt(`${weight}0`))}
        >
          0
        </Button>
        <Button
          type="tertiary"
          color="black"
          handler={() =>
            setWeight(
              weight.toString().substring(0, weight.toString().length - 1)
            )
          }
        >
          &lt;
        </Button>
      </FlexContainer>
      <Spacer height={32} />
      <Button
        type="primary"
        color="green"
        handler={handleAddToReport}
        fullWidth
      >
        Add Weight to Report
      </Button>
    </div>
  )
}
