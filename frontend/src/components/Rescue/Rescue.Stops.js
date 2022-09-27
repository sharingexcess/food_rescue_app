import {
  Heading,
  Accordion,
  AccordionItem,
  Flex,
  Button,
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
  const [showCompletedStops, setShowCompletedStops] = useState(
    rescue.status === STATUSES.COMPLETED
  )
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
      {completedStops.length ? (
        <Flex justify="space-between" align="center" h={8} px="4" my="4">
          <Heading
            as="h4"
            size="sm"
            fontWeight="600"
            letterSpacing="1"
            fontSize="sm"
            color="element.secondary"
            textTransform="uppercase"
          >
            Completed Stops
          </Heading>
          <Button
            variant="tertiary"
            size="sm"
            color="element.tertiary"
            onClick={() => setShowCompletedStops(!showCompletedStops)}
          >
            {showCompletedStops ? 'Hide' : 'Show'}
          </Button>
        </Flex>
      ) : null}
      {completedStops.length && showCompletedStops ? (
        <Accordion allowMultiple>
          {completedStops.map((stop, i) => (
            <AccordionItem key={i} border="none">
              <InactiveStop stop={stop} key={i} />
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
      {cancelledStops.length ? (
        <Flex justify="space-between" align="center" h={8} px="4" my="4">
          <Heading
            as="h4"
            size="sm"
            fontWeight="600"
            letterSpacing="1"
            fontSize="sm"
            color="element.secondary"
            textTransform="uppercase"
          >
            Cancelled Stops
          </Heading>
          <Button
            variant="tertiary"
            size="sm"
            color="element.tertiary"
            onClick={() => setShowCancelledStops(!showCancelledStops)}
          >
            {showCancelledStops ? 'Hide' : 'Show'}
          </Button>
        </Flex>
      ) : null}
      {showCancelledStops ? (
        <Accordion allowMultiple>
          {cancelledStops.map((stop, i) => (
            <AccordionItem key={i} border="none">
              <InactiveStop stop={stop} key={i} />
            </AccordionItem>
          ))}
        </Accordion>
      ) : null}
      {shouldAddStop && <AddBackupDelivery />}
    </>
  )
}
