import { Button, Text, Input, Flex, Checkbox } from '@chakra-ui/react'
import { useState, useEffect } from 'react'

function calculateExpression(expression) {
  // Use regex to split and calculate addition
  const numbers = expression.split('+').map(num => parseFloat(num.trim()))
  if (numbers.every(num => !isNaN(num))) {
    return numbers.reduce((acc, curr) => acc + curr, 0).toString()
  }
  return expression
}

export function WholesaleBeforeSorting({ setSummary, triggerReset }) {
  const [caseCount, setCaseCount] = useState('')
  const [totalCaseCount, setTotalCaseCount] = useState('')
  const [caseWeight, setCaseWeight] = useState('')
  const [firstPalletTotalWeight, setFirstPalletTotalWeight] = useState('')
  const [totalWeight, setTotalWeight] = useState('')
  const [palletType, setPalletType] = useState('')
  const [multiplePallets, setMultiplePallets] = useState('no')
  const [palletCount, setPalletCount] = useState('')

  useEffect(() => {
    let calculatedTotalCaseCount, calculatedTotalWeight, calculatedPalletCount
    let calculatedAverageCaseWeight = 0

    if (multiplePallets === 'no') {
      calculatedTotalCaseCount = Number(caseCount)
      calculatedTotalWeight = Number(firstPalletTotalWeight)
      calculatedPalletCount = 0 // Only one pallet is used
    } else {
      calculatedTotalCaseCount = Number(totalCaseCount)
      calculatedTotalWeight = Number(totalWeight)
      calculatedPalletCount = Number(palletCount) // Get the pallet count for multiple pallets
    }

    calculatedAverageCaseWeight = calculatedTotalCaseCount
      ? (calculatedTotalWeight / calculatedTotalCaseCount).toFixed(2)
      : 0

    setSummary({
      totalCaseCount: calculatedTotalCaseCount,
      averageCaseWeight: calculatedAverageCaseWeight,
      totalWeight: calculatedTotalWeight,
      palletCount: calculatedPalletCount, // Update the pallet count in summary
    })
  }, [
    caseCount,
    totalCaseCount,
    firstPalletTotalWeight,
    totalWeight,
    multiplePallets,
    palletCount,
  ]) // Include palletCount in the dependency list

  useEffect(() => {
    if (triggerReset) {
      setCaseCount('')
      setTotalCaseCount('')
      setCaseWeight('')
      setFirstPalletTotalWeight('')
      setTotalWeight('')
      setPalletType('')
      setMultiplePallets('no')
      setPalletCount('')
    }
  }, [triggerReset])

  // Calculate total weight of the 1st pallet
  useEffect(() => {
    if (caseCount && caseWeight) {
      const calculatedWeight =
        Number(caseCount) * Number(caseWeight) - palletWeight(palletType)
      setFirstPalletTotalWeight(calculatedWeight.toString())
    } else {
      setFirstPalletTotalWeight('')
    }
  }, [caseCount, caseWeight, palletType]) // Add palletType dependency

  // Calculate overall total weight for multiple pallets
  useEffect(() => {
    if (totalCaseCount && caseWeight && multiplePallets === 'yes') {
      const calculatedTotalWeight = Number(totalCaseCount) * Number(caseWeight)
      setTotalWeight(calculatedTotalWeight.toString())
    } else {
      setTotalWeight('')
    }
  }, [totalCaseCount, caseWeight, multiplePallets])

  const handleTotalCaseCountChange = e => {
    const inputValue = e.target.value
    setTotalCaseCount(inputValue)
  }

  const handleTotalCaseCountBlur = e => {
    const inputValue = e.target.value
    const calculatedValue = calculateExpression(inputValue)
    setTotalCaseCount(calculatedValue)
  }

  const handleCaseCountChange = e => {
    const inputValue = e.target.value
    setCaseCount(inputValue)
  }

  async function handleCaseCountBlur(e) {
    const inputValue = e.target.value
    const calculatedValue = calculateExpression(inputValue)
    setCaseCount(calculatedValue)
  }

  const handlePalletCountChange = e => {
    const inputValue = e.target.value
    setPalletCount(inputValue)
  }

  const handlePalletCountBlur = e => {
    const inputValue = e.target.value
    const calculatedValue = calculateExpression(inputValue)
    setPalletCount(calculatedValue)
  }

  useEffect(() => {
    if (firstPalletTotalWeight && caseCount) {
      const calculatedCaseWeight =
        (Number(firstPalletTotalWeight) + palletWeight(palletType)) /
        Number(caseCount)
      setCaseWeight(calculatedCaseWeight.toString())
    }
  }, [firstPalletTotalWeight, caseCount, palletType])

  return (
    <Flex direction="column" spacing={4}>
      <Flex direction="column" mb="4">
        <Text
          color="element.tertiary"
          fontSize="xs"
          fontWeight="700"
          mt="6"
          textTransform="uppercase"
        >
          Case Count of 1st Pallet
        </Text>
        <Input
          name="caseCount1stPallet"
          id="caseCount1stPallet"
          type="text"
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
          Case Weight (in lbs.)
        </Text>
        <Input
          name="caseWeight"
          id="caseWeight"
          type="number"
          min="0"
          fontSize="sm"
          value={caseWeight}
          onChange={e => setCaseWeight(e.target.value)}
          placeholder="Enter case weight (in lbs.)"
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
          Total weight of 1st pallet (in lbs.)
        </Text>
        <Input
          name="firstPalletTotalWeight"
          id="firstPalletTotalWeight"
          type="number"
          min="0"
          fontSize="sm"
          value={firstPalletTotalWeight}
          onChange={e => setFirstPalletTotalWeight(e.target.value)}
          placeholder="Enter total weight or it will be automatically calculated"
        />
      </Flex>
      <Flex direction="row" justifyContent="space-around" mb="4">
        <Button
          variant="outline"
          colorScheme="red"
          onClick={() => setPalletType('wood')}
          isActive={palletType === 'wood'}
        >
          Wood
        </Button>
        <Button
          variant="outline"
          colorScheme="green"
          onClick={() => setPalletType('black')}
          isActive={palletType === 'black'}
        >
          Black
        </Button>
        <Button
          variant="outline"
          colorScheme="blue"
          onClick={() => setPalletType('blue')}
          isActive={palletType === 'blue'}
        >
          Blue
        </Button>
        <Button
          variant="outline"
          colorScheme="black"
          onClick={() => setPalletType('other')}
          isActive={palletType === 'other'}
        >
          Other
        </Button>
      </Flex>
      <Flex direction="row" alignItems="center" mt="4">
        <Text color="element.tertiary" fontSize="sm" fontWeight="600" mr="4">
          Multiple pallets?
        </Text>
        <Checkbox
          isChecked={multiplePallets === 'yes'}
          onChange={() =>
            setMultiplePallets(multiplePallets === 'yes' ? null : 'yes')
          }
          mr="4"
        >
          Yes
        </Checkbox>
        <Checkbox
          isChecked={multiplePallets === 'no'}
          onChange={() =>
            setMultiplePallets(multiplePallets === 'no' ? null : 'no')
          }
        >
          No
        </Checkbox>
      </Flex>
      {multiplePallets === 'yes' && (
        <Flex direction="column">
          <Flex direction="column" mb="4">
            <Text
              color="element.tertiary"
              fontSize="xs"
              fontWeight="700"
              mt="6"
              textTransform="uppercase"
            >
              Total case count
            </Text>
            <Input
              name="totalCaseCount"
              id="totalCaseCount"
              type="text"
              fontSize="sm"
              value={totalCaseCount}
              onChange={handleTotalCaseCountChange}
              onBlur={handleTotalCaseCountBlur}
              placeholder="e.g., 200 + 10 + 30"
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
              Total weight
            </Text>
            <Input
              name="totalWeight"
              id="totalWeight"
              type="number"
              min="0"
              fontSize="sm"
              value={totalWeight}
              onChange={e => setTotalWeight(e.target.value)}
              placeholder="Enter weight (in lbs.)"
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
              Number of pallets
            </Text>
            <Input
              name="palletCount"
              id="palletCount"
              type="text"
              fontSize="sm"
              value={palletCount}
              onChange={handlePalletCountChange}
              onBlur={handlePalletCountBlur}
              placeholder=""
            />
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}

function palletWeight(type) {
  if (!type) return 0
  switch (type) {
    case 'wood':
      return 345
    case 'black':
      return 350
    case 'blue':
      return 373
    case 'other':
      return 0 // Change this if "other" type pallet has a specific weight
    default:
      return 0
  }
}
