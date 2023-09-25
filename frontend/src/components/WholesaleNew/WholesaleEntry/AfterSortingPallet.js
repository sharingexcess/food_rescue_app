import { useState, useEffect } from 'react'
import { Button, Text, Input, Flex } from '@chakra-ui/react'

export function AfterSortingPallet({
  onCaseCountChange,
  onCaseWeightChange,
  onTotalWeightChange,
  onPalletTypeChange,
}) {
  const [caseCount, setCaseCount] = useState('')
  const [caseWeight, setCaseWeight] = useState('')
  const [totalWeight, setTotalWeight] = useState('')
  const [palletType, setPalletType] = useState('')

  function palletWeight(type) {
    switch (type) {
      case 'wood':
        return 345
      case 'black':
        return 350
      case 'blue':
        return 373
      case 'other':
        return 0
      default:
        return 0
    }
  }

  const handleCaseCountChange = e => {
    const inputValue = e.target.value
    setCaseCount(inputValue)

    // Propagate the change to the parent component
    if (onCaseCountChange) {
      onCaseCountChange(Number(inputValue))
    }
  }

  const handleCaseWeightChange = e => {
    const inputValue = e.target.value
    setCaseWeight(inputValue)

    // Propagate the change to the parent component
    if (onCaseWeightChange) {
      onCaseWeightChange(Number(inputValue))
    }
  }

  const handleTotalWeightChange = e => {
    const inputValue = e.target.value
    setTotalWeight(inputValue)

    // Propagate the change to the parent component
    if (onTotalWeightChange) {
      onTotalWeightChange(Number(inputValue))
    }
  }

  const handlePalletTypeChange = type => {
    setPalletType(type)
    if (onPalletTypeChange) {
      onPalletTypeChange(type)
    }
  }

  useEffect(() => {
    const calculatedWeight =
      Number(caseCount) * Number(caseWeight) - palletWeight(palletType)
    setTotalWeight(calculatedWeight.toString())

    // Propagate the change to the parent component
    onTotalWeightChange(calculatedWeight)
  }, [caseCount, caseWeight, palletType])

  const handleCaseCountBlur = e => {
    const inputValue = e.target.value
    if (inputValue.includes('+')) {
      setCaseCount(inputValue)
    }
  }

  const handleCaseWeightBlur = e => {
    const inputValue = e.target.value
    if (inputValue.includes('+')) {
      setCaseWeight(inputValue)
    }
  }

  const handleTotalWeightBlur = e => {
    const inputValue = e.target.value
    if (inputValue.includes('+')) {
      setTotalWeight(inputValue)
    }
  }

  return (
    <Flex direction="column" p={6} my={-4}>
      <Flex direction="column" mb="4">
        <Text
          color="element.tertiary"
          fontSize="xs"
          fontWeight="700"
          textTransform="uppercase"
        >
          Case Count
        </Text>
        <Input
          type="number"
          min="0"
          fontSize="sm"
          value={caseCount}
          onChange={handleCaseCountChange}
          onBlur={handleCaseCountBlur}
          placeholder="Enter case count"
        />
      </Flex>

      <Flex direction="column" mb="4">
        <Text
          color="element.tertiary"
          fontSize="xs"
          fontWeight="700"
          mt="6"
          textTransform="uppercase"
        >
          Case Weight
        </Text>
        <Input
          type="number"
          min="0"
          fontSize="sm"
          value={caseWeight}
          onChange={handleCaseWeightChange}
          onBlur={handleCaseWeightBlur}
          placeholder="Enter case weight (e.g., in lbs.)"
        />
      </Flex>

      <Flex direction="column" mb="4">
        <Text
          color="element.tertiary"
          fontSize="xs"
          fontWeight="700"
          mt="6"
          textTransform="uppercase"
        >
          Total Weight
        </Text>
        <Input
          type="number"
          min="0"
          fontSize="sm"
          value={totalWeight}
          onChange={handleTotalWeightChange}
          onBlur={handleTotalWeightBlur}
          placeholder="Enter total weight (e.g., in lbs.)"
        />
      </Flex>
      <Flex direction="row" justifyContent="space-around" mb="4">
        <Button
          variant="outline"
          colorScheme="red"
          onClick={() => handlePalletTypeChange('wood')}
          isActive={palletType === 'wood'}
        >
          Wood
        </Button>
        <Button
          variant="outline"
          colorScheme="green"
          onClick={() => handlePalletTypeChange('black')}
          isActive={palletType === 'black'}
        >
          Black
        </Button>
        <Button
          variant="outline"
          colorScheme="blue"
          onClick={() => handlePalletTypeChange('blue')}
          isActive={palletType === 'blue'}
        >
          Blue
        </Button>
        <Button
          variant="outline"
          colorScheme="black"
          onClick={() => handlePalletTypeChange('other')}
          isActive={palletType === 'other'}
        >
          Other
        </Button>
      </Flex>
    </Flex>
  )
}