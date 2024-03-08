import { Button, Text, Input, Flex, Select } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useAuth } from 'hooks'
import { calculateExpression } from './helper'

export function WholesaleBeforeSorting({
  setSummary,
  triggerReset,
  formData,
  summary,
}) {
  console.log('formData >>>', formData)
  const [caseCount, setCaseCount] = useState(summary.totalCaseCount || '')
  const [caseWeight, setCaseWeight] = useState(summary.averageCaseWeight || '')
  const [totalWeight, setTotalWeight] = useState(
    formData.weight || summary.totalWeight || ''
  )
  const [palletType, setPalletType] = useState('')
  const [jackType, setJackType] = useState('')
  const [jackWeight, setJackWeight] = useState(0)

  useEffect(() => {
    setPalletType(summary.palletType || '')
    setJackType(summary.jackType || '')
    setJackWeight(summary.jackWeight || '')
  }, [])

  useEffect(() => {
    setSummary(prevValue => ({ ...prevValue, palletType }))
  }, [palletType])

  useEffect(() => {
    setSummary(prevValue => ({ ...prevValue, jackType }))
  }, [jackType])

  useEffect(() => {
    setSummary(prevValue => ({ ...prevValue, jackWeight }))
  }, [jackWeight])

  useEffect(() => {
    if (triggerReset) {
      setCaseCount('')
      setCaseWeight('')
      setTotalWeight('')
      setPalletType('')
      setJackType('')
      setJackWeight(0)
    }
  }, [triggerReset])

  useEffect(() => {
    if (formData) {
      setCaseCount(formData.totalCaseCount || summary.totalCaseCount || '')
      setCaseWeight(
        formData.averageCaseWeight || summary.averageCaseWeight || ''
      )
      setTotalWeight(formData.weight || summary.totalWeight || '')
    }
  }, [formData])

  const { user } = useAuth()

  useEffect(() => {
    const calculatedCaseCount = parseFloat(calculateExpression(caseCount))
    const weight = parseFloat(caseWeight)

    if (!isNaN(calculatedCaseCount) && !isNaN(weight)) {
      let newTotalWeight = calculatedCaseCount * weight
      newTotalWeight -= jackWeight
      if (formData.weight) {
        setTotalWeight(formData.weight)
        setJackType(formData.jackType)
      } else if (palletType) {
        handlePalletTypeChange(palletType, false)
      } else {
        setTotalWeight(newTotalWeight)
      }
    }
  }, [caseCount, caseWeight, jackWeight, palletType]) // Include jackWeight in the dependency array

  function handlePalletTypeChange(type, setType = true) {
    if (setType) {
      setPalletType(type)
    }

    // Calculate the base weight from case count and case weight
    const calculatedCaseCount = parseFloat(calculateExpression(caseCount))
    const weight = parseFloat(caseWeight)
    let baseWeight = 0
    if (!isNaN(calculatedCaseCount) && !isNaN(weight)) {
      baseWeight = calculatedCaseCount * weight
    }

    // Calculate the weight of the pallet
    const palletWt = palletWeight(type, jackWeight)

    // Recalculate the new total weight
    const newTotalWeight = baseWeight + palletWt
    setTotalWeight(newTotalWeight)
  }

  function handleJackSelectChange(e) {
    const selectedJackType = e.target.value
    setJackType(selectedJackType)

    if (selectedJackType === 'none') {
      // If 'none' is selected, set jack weight to 0 and recalculate total weight
      setJackWeight(0)
      recalculateTotalWeight(0)
    } else {
      const jack = user.jacks.find(jack => jack.name === selectedJackType)
      if (jack) {
        const newJackWeight = parseFloat(jack.weight)
        setJackWeight(newJackWeight) // Update jackWeight state
        recalculateTotalWeight(newJackWeight)
      }
    }
  }

  function recalculateTotalWeight(newJackWeight) {
    // Recalculate total weight with new jack weight
    const calculatedCaseCount = parseFloat(calculateExpression(caseCount))
    const weight = parseFloat(caseWeight)
    if (!isNaN(calculatedCaseCount) && !isNaN(weight)) {
      const newTotalWeight = calculatedCaseCount * weight - newJackWeight
      setTotalWeight(newTotalWeight)

      // Update the summary state
      if (caseCount && caseWeight) {
        setSummary(prevValue => ({
          ...prevValue,
          totalCaseCount: parseInt(calculateExpression(caseCount)),
          averageCaseWeight: parseFloat(caseWeight),
          totalWeight: newTotalWeight, // Updated total weight
        }))
      }
    }
  }

  // handles total weight change
  function handleTotalWeightChange(e) {
    if (isNaN(e.target.value) || e.target.value === '') {
      setTotalWeight('')
      setCaseWeight('')
      return
    }

    const newTotalWeight = parseFloat(e.target.value)
    setTotalWeight(newTotalWeight)
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
      setSummary(prevValue => ({
        ...prevValue,
        totalCaseCount: parseInt(calculateExpression(caseCount)),
        averageCaseWeight: parseFloat(caseWeight),
        totalWeight: parseFloat(totalWeight),
      }))
    }
  }, [caseCount, caseWeight, totalWeight])

  function handleKeyPress(event, inputType) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      const value = event.target.value
      switch (inputType) {
        case 'caseCount': {
          const calculatedValue = calculateExpression(value)
          setCaseCount(calculatedValue)
          recalculateTotalWeight(jackWeight)
          break
        }
        case 'caseWeight': {
          setCaseWeight(value)
          recalculateTotalWeight(jackWeight)
          break
        }
        case 'totalWeight': {
          setTotalWeight(value)
          break
        }
        default:
          break
      }
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
          onKeyDown={e => handleKeyPress(e, 'caseCount')}
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
          onKeyDown={e => handleKeyPress(e, 'caseWeight')}
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
          onKeyDown={e => handleKeyPress(e, 'totalWeight')}
        />
      </Flex>
      <Flex direction="row" justifyContent="space-around" mb="4" mt="2">
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
      <Flex direction="column" mb="4">
        <Text
          color="element.tertiary"
          fontSize="xs"
          fontWeight="700"
          textTranfsform="uppercase"
        >
          Jack Type
        </Text>
        <Select
          name="palletType"
          id="palletType"
          value={jackType}
          onChange={handleJackSelectChange}
          placeholder="Select jack type"
        >
          <option value="none">None</option> {/* Add None option */}
          {user.jacks.map((jack, index) => (
            <option key={index} value={jack.name}>
              {jack.name} - {jack.weight} lbs
            </option>
          ))}
        </Select>
      </Flex>
    </Flex>
  )
}

function palletWeight(type, additionalWeight) {
  const baseWeights = {
    wood: 55,
    black: 20,
    blue: 55,
    other: 0,
  }

  return (baseWeights[type] || 0) - additionalWeight
}
