import {
  Box,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Flex,
  CloseButton,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

import { calculateCurrentLoad } from 'helpers'

export function WholesaleAllocationCard({
  index,
  transfer,
  rescue,
  onAllocationUpdate,
  onRemove,
}) {
  const initialSliderValue = 0
  const [sliderValue, setSliderValue] = useState(initialSliderValue)
  const [remainingWeight, setRemainingWeight] = useState('')

  const [calculatedWeight, setCalculatedWeight] = useState(
    sliderValue * transfer.average_case_weight
  )

  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (rescue) {
      setRemainingWeight(calculateCurrentLoad(rescue))
    }
  }, [rescue])

  useEffect(() => {
    let weight
    if (
      sliderValue ===
      parseInt((remainingWeight / transfer.average_case_weight).toFixed(0))
    ) {
      weight = remainingWeight
    } else {
      weight = (sliderValue * transfer.average_case_weight).toFixed(0)
    }
    setCalculatedWeight(weight)
    onAllocationUpdate(
      rescue,
      transfer.rescue_id,
      transfer.handler_id,
      transfer.organization_id,
      transfer.location_id,
      sliderValue,
      weight,
      (weight / transfer.total_weight) * 100,
      notes
    )
  }, [sliderValue, transfer, notes])

  const SliderLabel = ({ children }) => (
    <Text w="48px" fontWeight="bold" textAlign="center">
      {children}
    </Text>
  )

  return (
    <Box
      key={index}
      mt={4}
      borderWidth="1px"
      borderRadius="md"
      p={4}
      shadow="md"
    >
      <Flex justifyContent="space-between">
        <Flex>
          <Text fontWeight={'bold'} mr={2}>
            {transfer.product_type}
          </Text>
          <Text mr={2} fontWeight={'200'}>
            |{'  '}
            {transfer.organization.name}
            {'  '}|
          </Text>
          {remainingWeight ? (
            <Text fontWeight={'200'}>
              {'  '}
              {remainingWeight}
              {'  '} {' lbs.'}
            </Text>
          ) : null}
        </Flex>
        <CloseButton onClick={() => onRemove(transfer)} />
      </Flex>
      <Flex mb={2}>
        <Text>Avg case weight: </Text>
        <Text fontWeight={'bold'} ml={2}>
          {' '}
          {transfer.average_case_weight}
          {' lbs.'}
        </Text>
      </Flex>

      <Text textAlign="center" fontWeight="bold" mb={2}>
        {sliderValue} CASES
      </Text>

      <Flex align="center" mt={2} gap={4}>
        <SliderLabel>0</SliderLabel>
        <Slider
          aria-label="case-count-slider"
          defaultValue={initialSliderValue}
          min={0}
          max={(remainingWeight / transfer.average_case_weight).toFixed(0)}
          step={1}
          onChange={setSliderValue}
          flexGrow={1}
          colorScheme="green"
        >
          <SliderTrack h="2" borderRadius="4px">
            <SliderFilledTrack h="2" borderRadius="4px" />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <SliderLabel>
          {(remainingWeight / transfer.average_case_weight).toFixed(0)}
        </SliderLabel>
      </Flex>

      <Text mt={4}>
        Total Weight: {Math.ceil(calculatedWeight)}
        {' lbs.'}
      </Text>

      <Box mt={4}>
        <Text fontWeight="500" mb={2}>
          Notes
        </Text>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add your notes here..."
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            borderColor: '#E2E8F0',
          }}
        ></textarea>
      </Box>
    </Box>
  )
}
