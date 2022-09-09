import { ChevronUpIcon } from '@chakra-ui/icons'
import {
  Box,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Text,
  Flex,
  IconButton,
} from '@chakra-ui/react'
import { Reorder } from 'framer-motion'
import { STATUSES } from 'helpers'
import { useEffect, useState } from 'react'
import { Stop } from './EditRescue.Stop'

export function Stops({ stops, setStops, removeStop }) {
  // Because the Drag and Drop component can only handle string items,
  // stringify each stop here, then parse as we pass to the component

  const [showCompletedStops, setShowCompletedStops] = useState(false)
  const [showCancelledStops, setShowCancelledStops] = useState(false)
  const cancelledStops =
    stops?.filter(i => i.status === STATUSES.CANCELLED) || []
  const completedStops =
    stops?.filter(i => i.status === STATUSES.COMPLETED) || []
  const [remainingStringStops, setRemainingStringStops] = useState(
    stops
      ?.filter(
        i =>
          i.is_deleted === undefined &&
          [STATUSES.ACTIVE, STATUSES.SCHEDULED].includes(i.status)
      )
      .map(stop => JSON.stringify(stop)) || []
  )
  useEffect(() => {
    setRemainingStringStops(
      stops
        ?.filter(
          i =>
            i.is_deleted === undefined &&
            [STATUSES.ACTIVE, STATUSES.SCHEDULED].includes(i.status)
        )
        .map(stop => JSON.stringify(stop)) || []
    )
  }, [stops])

  // keep track of when drag events finish to update parent state
  const [shouldReorder, setShouldReorder] = useState(false)
  useEffect(() => {
    if (shouldReorder && remainingStringStops) {
      // if we have reordered stops, update the parent state
      setStops([
        ...cancelledStops,
        ...completedStops,
        ...remainingStringStops.map(stop => JSON.parse(stop)),
      ])
      setShouldReorder(false)
    }
  }, [shouldReorder, remainingStringStops])

  function handlePointerUp() {
    // when a drag event stops, allow animations to finish smoothly
    // then trigger an update of the parent state
    setTimeout(() => {
      setShouldReorder(true)
    }, 800)
  }

  return (
    <>
      {cancelledStops.length ? (
        <Flex justify="space-between" align="end" h={8}>
          <Heading
            as="h4"
            size="sm"
            mt="12"
            fontWeight="600"
            letterSpacing="1"
            fontSize="sm"
            color="element.secondary"
            textTransform="uppercase"
          >
            ❌&nbsp;&nbsp;Cancelled Stops
          </Heading>
          <IconButton
            aria-label="Cancelled rescue stops"
            variant="tertiary"
            color="element.tertiary"
            icon={
              <ChevronUpIcon
                h={8}
                w={8}
                transform={`rotate(${showCancelledStops ? '-180deg' : '0deg'})`}
                transition="transform 0.3s ease"
              />
            }
            onClick={() => setShowCancelledStops(!showCancelledStops)}
          />
        </Flex>
      ) : null}
      {cancelledStops.length && showCancelledStops ? (
        <Accordion allowMultiple>
          {cancelledStops.map((stop, i) => (
            <AccordionItem key={i}>
              <AccordionButton>
                <Flex w="100%" gap={4}>
                  <Text
                    as="h3"
                    size="md"
                    fontWeight="600"
                    textTransform="uppercase"
                    color="element.secondary"
                  >
                    {stop.type}
                  </Text>
                  <Text as="p" fontWeight="300" color="element.secondary">
                    {stop.location.nickname || stop.location.address1}
                  </Text>
                  <AccordionIcon ml="auto" />
                </Flex>
              </AccordionButton>
              <AccordionPanel>
                <Stop stop={stop} removeStop={() => removeStop(i)} />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      ) : null}
      {completedStops.length ? (
        <Flex justify="space-between" align="end" h={8} my={4}>
          <Heading
            as="h4"
            size="sm"
            mt="12"
            fontWeight="600"
            letterSpacing="1"
            fontSize="sm"
            color="element.secondary"
            textTransform="uppercase"
          >
            ✅&nbsp;&nbsp;Completed Stops
          </Heading>
          <IconButton
            aria-label="Completed rescue stops"
            variant="tertiary"
            color="element.tertiary"
            icon={
              <ChevronUpIcon
                h={8}
                w={8}
                transform={`rotate(${showCompletedStops ? '-180deg' : '0deg'})`}
                transition="transform 0.3s ease"
              />
            }
            onClick={() => setShowCompletedStops(!showCompletedStops)}
          />
        </Flex>
      ) : null}
      {completedStops.length && showCompletedStops ? (
        <Accordion allowMultiple>
          {completedStops.map((stop, i) => (
            <AccordionItem key={i}>
              <AccordionButton>
                <Flex w="100%" gap={4}>
                  <Text
                    as="h3"
                    size="md"
                    fontWeight="600"
                    textTransform="uppercase"
                    color="element.secondary"
                  >
                    {stop.type}
                  </Text>
                  <Text as="p" fontWeight="300" color="element.secondary">
                    {stop.location.nickname || stop.location.address1}
                  </Text>
                  <AccordionIcon ml="auto" />
                </Flex>
              </AccordionButton>
              <AccordionPanel>
                <Stop stop={stop} removeStop={() => removeStop(i)} />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      ) : null}

      {remainingStringStops.length ? (
        <Heading
          as="h4"
          size="sm"
          mt="12"
          fontWeight="600"
          letterSpacing="1"
          fontSize="sm"
          color="element.secondary"
          textTransform="uppercase"
        >
          ⏩&nbsp;&nbsp;Remaining Stops
        </Heading>
      ) : null}
      <Reorder.Group
        as="section"
        axis="y"
        values={remainingStringStops}
        onReorder={setRemainingStringStops}
      >
        {remainingStringStops.map((stringStop, i) => (
          <Reorder.Item
            as="div"
            key={stringStop}
            value={stringStop}
            onPointerUp={handlePointerUp}
          >
            <Stop
              stop={JSON.parse(stringStop)}
              removeStop={() => removeStop(i)}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <Box h="2" />
    </>
  )
}
