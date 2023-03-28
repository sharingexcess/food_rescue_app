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
import { ActiveTransfer } from './Rescue.ActiveTransfer'
import { AddBackupDelivery } from './Rescue.AddBackupDelivery'
import { InactiveTransfer } from './Rescue.InactiveTransfer'

export function RescueTransfers() {
  const { rescue, activeTransfer } = useRescueContext()
  // The max margin of error is equal to the number of transfers,
  // assuming we needed to round the same direction for every transfer.
  // If the remaining weight is greater than that, we need another
  // delivery to ensure all food finds a home.
  const remainingWeight = calculateCurrentLoad(rescue)
  const shouldAddTransfer =
    remainingWeight > rescue.transfers.length &&
    rescue.transfers[rescue.transfers.length - 1].status === STATUSES.COMPLETED
  // split transfers to cancelled, completed, remaining
  // const [showCompletedTransfers, setShowCompletedTransfers] = useState(
  //   rescue.status === STATUSES.COMPLETED
  // )
  const [showCancelledTransfers, setShowCancelledTransfers] = useState(false)

  const cancelledTransfers =
    rescue.transfers?.filter(i => i.status === STATUSES.CANCELLED) || []
  const completedTransfers =
    rescue.transfers?.filter(i => i.status === STATUSES.COMPLETED) || []
  const remainingTransfers =
    rescue.transfers?.filter(i => i.status === STATUSES.SCHEDULED) || []
  return (
    <>
      {/* TESTING OUT TURNING OFF COLLAPSING COMPLETED TRANSFERS */}
      {/* {completedTransfers.length ? (
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
            Completed Transfers
          </Heading>
          <Button
            variant="tertiary"
            size="sm"
            color="element.tertiary"
            onClick={() => setShowCompletedTransfers(!showCompletedTransfers)}
          >
            {showCompletedTransfers ? 'Hide' : 'Show'}
          </Button>
        </Flex>
      ) : null} */}
      {/* {completedTransfers.length && showCompletedTransfers ? (
        <Accordion allowMultiple> */}
      {completedTransfers.map((transfer, i) => (
        // <AccordionItem key={i} border="none">
        <InactiveTransfer transfer={transfer} key={i} />
        // </AccordionItem>
      ))}
      {/* </Accordion>
      ) : null} */}
      {remainingTransfers.map((transfer, i) =>
        transfer.id === activeTransfer?.id ? (
          <ActiveTransfer key={i} transfer={transfer} />
        ) : transfer.is_deleted === undefined ? (
          <InactiveTransfer transfer={transfer} key={i} />
        ) : null
      )}
      {cancelledTransfers.length ? (
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
            Cancelled Transfers
          </Heading>
          <Button
            variant="tertiary"
            size="sm"
            color="element.tertiary"
            onClick={() => setShowCancelledTransfers(!showCancelledTransfers)}
          >
            {showCancelledTransfers ? 'Hide' : 'Show'}
          </Button>
        </Flex>
      ) : null}
      {showCancelledTransfers ? (
        <Accordion allowMultiple>
          {cancelledTransfers.map((transfer, i) => (
            <AccordionItem key={i} border="none">
              <InactiveTransfer transfer={transfer} key={i} />
            </AccordionItem>
          ))}
        </Accordion>
      ) : null}
      {shouldAddTransfer && <AddBackupDelivery />}
    </>
  )
}
