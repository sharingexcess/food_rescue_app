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
import { useRescueContext, useDeliveryContext } from 'components'
import { STATUSES } from 'helpers'
import { useEffect, useState } from 'react'

export function Body() {
  const { setOpenStop, rescue } = useRescueContext()
  const {
    delivery,
    currentLoad,
    poundsDropped,
    setPoundsDropped,
    percentTotalDropped,
    setPercentTotalDropped,
  } = useDeliveryContext()

  // create an internal copy of poundsDropped
  // so that we don't unfocus the input on change
  // due to the parent component re-rendering
  const [tempInputValue, setTempInputValue] = useState(poundsDropped)

  // update the internal copy whenever the external state value updates
  useEffect(() => setTempInputValue(poundsDropped), [poundsDropped])

  async function handlePoundsInputChange() {
    const updatedPoundsDropped = Math.min(
      Math.max(parseInt(tempInputValue) || 0, 0),
      currentLoad
    )
    setTempInputValue(updatedPoundsDropped)
    setPoundsDropped(updatedPoundsDropped)
    setPercentTotalDropped(
      Math.round((updatedPoundsDropped / currentLoad) * 100) || 0
    )
  }

  async function handleChangeSlider(value) {
    setPercentTotalDropped(value)
    setPoundsDropped(Math.round((value / 100) * currentLoad))
  }

  // prevent editing the last delivery of completed rescues
  // this could leave a rescue in an invalid state
  const disabled =
    rescue.status === STATUSES.COMPLETED &&
    rescue.stop_ids.findIndex(i => i === delivery.id) ===
      rescue.stop_ids.length - 1

  if (!delivery) return null
  return delivery.status === STATUSES.SCHEDULED ? (
    <Flex direction="column" align="center" w="100%" py="8">
      <Heading as="h4" size="md" color="element.primary" mb="2">
        This delivery isn't active yet.
      </Heading>
      <Text align="center" fontSize="sm" color="element.secondary">
        {rescue.status === STATUSES.ACTIVE
          ? 'You can enter data here once you complete all previous stops along your rescue.'
          : 'Ready to go? Start this rescue to begin entering data.'}
      </Text>
    </Flex>
  ) : delivery.status === STATUSES.CANCELLED ? (
    <Flex direction="column" align="center" w="100%" py="8">
      <Heading as="h4" size="md" color="element.primary" mb="2">
        This delivery has been cancelled.
      </Heading>
    </Flex>
  ) : (
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
          {percentTotalDropped}%
        </Text>
        <Slider
          aria-label="slider-ex-1"
          colorScheme="green"
          defaultValue={percentTotalDropped}
          value={percentTotalDropped}
          onChange={handleChangeSlider}
          flexGrow={1}
          disabled={disabled}
        >
          <SliderTrack h="2" borderRadius="4px">
            <SliderFilledTrack h="2" borderRadius="4px" />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Flex>
      {disabled && (
        <Text fontSize="sm" my="8" align="center" color="element.secondary">
          Heads up: you can't update the percentage for the last stop of a
          completed rescue.
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
              onClick={() => setOpenStop(null)}
              display="inline"
              px="2px"
            >
              update your previous deliveries
            </Button>
            .
          </Text>
        </Flex>
      )}
    </Flex>
  )
}
