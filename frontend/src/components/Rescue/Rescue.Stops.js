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
import { STATUSES, calculateCurrentLoad } from 'helpers'
import { useState } from 'react'
import { useRescueContext } from './Rescue'
import { ActiveStop } from './Rescue.ActiveStop'
import { AddBackupDelivery } from './Rescue.AddBackupDelivery'
import { InactiveStop } from './Rescue.InactiveStop'

export function RescueStops() {
  const { rescue } = useRescueContext()
  // The max margin of error is equal to the number of stops,
  // assuming we needed to round the same direction for every stop.
  // If the remaining weight is greater than that, we need another
  // delivery to ensure all food finds a home.
  const remainingWeight = calculateCurrentLoad(rescue)
  const shouldAddStop =
    remainingWeight > rescue.stops.length &&
    rescue.stops[rescue.stops.length - 1].status === STATUSES.COMPLETED
  // split stops to cancelled, completed, remaining
  const [showCompletedStops, setShowCompletedStops] = useState(false)
  const [showCancelledStops, setShowCancelledStops] = useState(false)

  const cancelledStops =
    rescue.stops?.filter(i => i.status === STATUSES.CANCELLED) || []
  const completedStops =
    rescue.stops?.filter(i => i.status === STATUSES.COMPLETED) || []
  const remainingStops =
    rescue.stops?.filter(i =>
      [STATUSES.ACTIVE, STATUSES.SCHEDULED].includes(i.status)
    ) || []
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
                <InactiveStop stop={stop} key={i} />
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
                <InactiveStop stop={stop} key={i} />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      ) : null}
      {remainingStops.map((stop, i) =>
        stop.status === STATUSES.ACTIVE ? (
          <ActiveStop key={i} stop={stop} />
        ) : stop.is_deleted === undefined ? (
          <InactiveStop stop={stop} key={i} />
        ) : null
      )}
      {shouldAddStop && <AddBackupDelivery />}
    </>
  )
}
