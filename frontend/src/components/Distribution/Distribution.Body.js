import {
  Button,
  Flex,
  Heading,
  Input,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
} from '@chakra-ui/react'
import { useRescueContext, useDistributionContext } from 'components'
import { STATUSES } from 'helpers'
import { useEffect, useState } from 'react'

export function Body() {
  const { setOpenTransfer, rescue, activeTransfer } = useRescueContext()
  const {
    distribution,
    currentLoad,
    poundsDropped,
    setPoundsDropped,
    percentTotalDropped,
    setPercentTotalDropped,
  } = useDistributionContext()

  // create an internal copy of poundsDropped
  // so that we don't unfocus the input on change
  // due to the parent component re-rendering
  const [tempInputValue, setTempInputValue] = useState(poundsDropped)

  // update the internal copy whenever the external state value updates
  useEffect(() => setTempInputValue(poundsDropped), [poundsDropped])

  async function handlePoundsInputChange() {
    const updatedPoundsDropped = Math.min(
      Math.max(parseFloat(tempInputValue) || 0, 0),
      currentLoad
    )
    setTempInputValue(updatedPoundsDropped)
    setPoundsDropped(updatedPoundsDropped)
    setPercentTotalDropped(
      parseFloat(((updatedPoundsDropped / currentLoad) * 100).toFixed(3)) || 0
    )
  }

  async function handleChangeSlider(value) {
    setPercentTotalDropped(value)
    setPoundsDropped(Math.round((value / 100) * currentLoad))
  }

  // prevent editing the last distribution of completed rescues
  // this could leave a rescue in an invalid state
  const disabled = rescue.status === STATUSES.COMPLETED

  if (!distribution) return null

  return distribution?.status === STATUSES.CANCELLED ? (
    <Flex direction="column" align="center" w="100%" py="8">
      <Heading as="h4" size="md" color="element.primary" mb="2">
        This distribution has been cancelled.
      </Heading>
    </Flex>
  ) : distribution?.id === activeTransfer?.id ||
    distribution?.status === STATUSES.COMPLETED ? (
    <Flex direction="column" align="center">
      <Text textAlign="center" fontWeight={400} mb={4}>
        How much of your current load
        <br />
        <Text as="span" fontWeight={600}>
          ({currentLoad} lbs.)
        </Text>{' '}
        are you delivering?
      </Text>
      <Flex>
        <Input
          w="96px"
          h="64px"
          fontSize="4xl"
          fontWeight="bold"
          color="element.primary"
          type="number"
          min="0"
          max={currentLoad}
          value={tempInputValue}
          onChange={e => setTempInputValue(e.target.value)}
          onBlur={() => handlePoundsInputChange()}
          textAlign="right"
          py="2"
          disabled={disabled}
        />
        <Text fontSize="3xl" fontWeight="bold" ml="3" mt="2">
          lbs.
        </Text>
      </Flex>
      <Flex justify="start" w="100%" gap={4} align="center" mt={8} maxW="500px">
        <Text w="48px" fontWeight="bold">
          {percentTotalDropped.toFixed(0)}%
        </Text>
        <Slider
          aria-label="slider-ex-1"
          colorScheme="green"
          defaultValue={percentTotalDropped}
          value={percentTotalDropped}
          onChange={handleChangeSlider}
          flexGrow={1}
          disabled={disabled}
          step={0.1}
        >
          <SliderTrack h="2" borderRadius="4px">
            <SliderFilledTrack h="2" borderRadius="4px" />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Flex>
      {disabled && (
        <Text fontSize="sm" my="8" align="center" color="element.secondary">
          <b>Heads up:</b> you can't update the dropoff percentage once a rescue
          is completed.
        </Text>
      )}
      {currentLoad === 0 && (
        <Flex direction="column" justify="center" mt="4">
          <Text textAlign="center" fontSize="xs" m="0">
            You have nothing to deliver! If this is by accident,
            <br />
            you can always{' '}
            <Button
              variant="tertiary"
              fontSize="xs"
              size="xs"
              onClick={() => setOpenTransfer(null)}
              display="inline"
              px="2px"
            >
              update your previous distributions
            </Button>
            .
          </Text>
        </Flex>
      )}
    </Flex>
  ) : (
    <Flex direction="column" align="center" w="100%" py="8">
      <Heading as="h4" size="md" color="element.primary" mb="2">
        This distribution isn't active yet.
      </Heading>
      <Text align="center" fontSize="sm" color="element.secondary">
        {rescue.status === STATUSES.ACTIVE
          ? 'You can enter data here once you complete all previous stops along your rescue.'
          : 'Ready to go? Start this rescue to begin entering data.'}
      </Text>
    </Flex>
  )
}
