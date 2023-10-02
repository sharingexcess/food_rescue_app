import { Button, Text, Input, Flex } from '@chakra-ui/react'
import { useState, useEffect } from 'react'

export function calculateExpression(expression) {
  try {
    // Splitting by '+' first
    const additionParts = expression.split('+')

    const result = additionParts.reduce((acc, part) => {
      const subtractionParts = part
        .split('-')
        .map(num => parseFloat(num.trim()))

      if (subtractionParts.some(num => isNaN(num))) {
        throw new Error('Invalid number')
      }

      const subtractionResult = subtractionParts
        .slice(1)
        .reduce((acc, curr) => acc - curr, subtractionParts[0])

      return acc + subtractionResult
    }, 0)

    return result.toString()
  } catch (err) {
    return expression
  }
}

export function WholesaleBeforeSorting({ setSummary, triggerReset, formData }) {
  const [caseCount, setCaseCount] = useState('')
  const [caseWeight, setCaseWeight] = useState('')
  const [totalWeight, setTotalWeight] = useState('')
  const [palletType, setPalletType] = useState('')

  const [originalTotalWeight, setOriginalTotalWeight] = useState('')

  useEffect(() => {
    if (triggerReset) {
      setCaseCount('')
      setCaseWeight('')
      setTotalWeight('')
      setPalletType('')
    }
  }, [triggerReset])

  useEffect(() => {
    if (formData) {
      setCaseCount(formData.totalCaseCount)
      setCaseWeight(formData.averageCaseWeight)
      setTotalWeight(formData.totalWeight)
      setPalletType(formData.palletType)
    }
  }, [formData])

  useEffect(() => {
    const calculatedCaseCount = parseFloat(calculateExpression(caseCount))
    const weight = parseFloat(caseWeight)

    if (!isNaN(calculatedCaseCount) && !isNaN(weight)) {
      const newTotalWeight = Math.max(parseInt(calculatedCaseCount * weight))
      setTotalWeight(newTotalWeight)
      setOriginalTotalWeight(newTotalWeight)
    }
  }, [caseCount, caseWeight])

  function handlePalletTypeChange(type) {
    setPalletType(type)

    const baseWeight = originalTotalWeight || totalWeight

    const palletWt = palletWeight(type)
    const newTotalWeight = baseWeight - palletWt
    setTotalWeight(newTotalWeight)

    // TODO -- Update average case weight. Safely please
  }

  function handleTotalWeightChange(e) {
    if (isNaN(e.target.value) || e.target.value === '') {
      setTotalWeight('')
      setCaseWeight('')
      setOriginalTotalWeight('')
      return
    }

    const newTotalWeight = parseFloat(e.target.value)
    setTotalWeight(newTotalWeight)
    setOriginalTotalWeight(newTotalWeight)
    if (!isNaN(newTotalWeight) && caseCount) {
      const calculatedCaseCount = parseFloat(calculateExpression(caseCount))
      if (calculatedCaseCount !== 0) {
        const newAverageCaseWeight = newTotalWeight / calculatedCaseCount
        setCaseWeight(newAverageCaseWeight)
      }
    } else {
      setCaseWeight('')
    }
    setTotalWeight(newTotalWeight)
  }

  useEffect(() => {
    // Check if all three values are present and valid
    if (caseCount && caseWeight && totalWeight) {
      setSummary({
        totalCaseCount: parseInt(calculateExpression(caseCount)),
        averageCaseWeight: parseFloat(caseWeight),
        totalWeight: parseFloat(totalWeight),
      })
    }
  }, [caseCount, caseWeight, totalWeight])

  function handleKeyPress(event, callback) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      callback(event)
      event.target.blur()
    }
  }

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
          Total case count
        </Text>
        <Input
          name="caseCount1stPallet"
          id="caseCount1stPallet"
          type="text"
          fontSize="sm"
          value={caseCount}
          onChange={e => setCaseCount(e.target.value)}
          onBlur={e => {
            const calculatedValue = calculateExpression(e.target.value)
            setCaseCount(calculatedValue)
          }}
          placeholder="30 or 20+10"
          onKeyDown={e =>
            handleKeyPress(e, ev => {
              const calculatedValue = calculateExpression(ev.target.value)
              setCaseCount(calculatedValue)
            })
          }
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
          Average Case Weight
        </Text>
        <Input
          name="caseWeight"
          id="caseWeight"
          type="number"
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
          Total weight
        </Text>
        <Input
          name="totalWeight"
          id="totalWeight"
          type="number"
          min="0"
          fontSize="sm"
          value={totalWeight}
          onChange={handleTotalWeightChange}
          placeholder="Calculated automatically or enter total weight (in lbs.)"
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

function palletWeight(type) {
  if (!type) return 0
  switch (type) {
    case 'wood':
      return 407
    case 'black':
      return 412
    case 'blue':
      return 435
    case 'other':
      return 0 // Change this if "other" type pallet has a specific weight
    default:
      return 0
  }
}
