import { ChevronUpIcon } from '@chakra-ui/icons'
import {
  Box,
  Heading,
  Accordion,
  AccordionItem,
  Flex,
  IconButton,
} from '@chakra-ui/react'
import { Reorder } from 'framer-motion'
import { STATUSES } from 'helpers'
import { useEffect, useState } from 'react'
import { Transfer } from './EditRescue.Transfer'

export function Transfers({ transfers, setTransfers, removeTransfer }) {
  // Because the Drag and Drop component can only handle string items,
  // stringify each transfer here, then parse as we pass to the component

  const [showCompletedTransfers, setShowCompletedTransfers] = useState(false)
  const [showCancelledTransfers, setShowCancelledTransfers] = useState(false)
  const cancelledTransfers =
    transfers?.filter(i => i.status === STATUSES.CANCELLED) || []
  const completedTransfers =
    transfers?.filter(i => i.status === STATUSES.COMPLETED) || []
  const [remainingStringTransfers, setRemainingStringTransfers] = useState(
    transfers
      ?.filter(
        i =>
          i.is_deleted === undefined &&
          [STATUSES.ACTIVE, STATUSES.SCHEDULED].includes(i.status)
      )
      .map(transfer => JSON.stringify(transfer)) || []
  )
  useEffect(() => {
    setRemainingStringTransfers(
      transfers
        ?.filter(
          i =>
            i.is_deleted === undefined &&
            [STATUSES.ACTIVE, STATUSES.SCHEDULED].includes(i.status)
        )
        .map(transfer => JSON.stringify(transfer)) || []
    )
  }, [transfers])

  // keep track of when drag events finish to update parent state
  const [shouldReorder, setShouldReorder] = useState(false)
  useEffect(() => {
    if (shouldReorder && remainingStringTransfers) {
      // if we have reordered transfers, update the parent state
      setTransfers([
        ...cancelledTransfers,
        ...completedTransfers,
        ...remainingStringTransfers.map(transfer => JSON.parse(transfer)),
      ])
      setShouldReorder(false)
    }
  }, [shouldReorder, remainingStringTransfers])

  function handlePointerUp() {
    // when a drag event transfers, allow animations to finish smoothly
    // then trigger an update of the parent state
    setTimeout(() => {
      setShouldReorder(true)
    }, 800)
  }

  return (
    <>
      {cancelledTransfers.length ? (
        <Flex justify="space-between" align="center" my="4">
          <Heading
            as="h4"
            size="sm"
            fontWeight="600"
            letterSpacing="1"
            fontSize="sm"
            color="element.secondary"
            textTransform="uppercase"
          >
            ❌&nbsp;&nbsp;Cancelled Transfers
          </Heading>
          <IconButton
            aria-label="Cancelled rescue transfers"
            variant="tertiary"
            color="element.tertiary"
            icon={
              <ChevronUpIcon
                h={8}
                w={8}
                transform={`rotate(${
                  showCancelledTransfers ? '-180deg' : '0deg'
                })`}
                transition="transform 0.3s ease"
              />
            }
            onClick={() => setShowCancelledTransfers(!showCancelledTransfers)}
          />
        </Flex>
      ) : null}
      {cancelledTransfers.length && showCancelledTransfers ? (
        <Accordion allowMultiple>
          {cancelledTransfers.map((transfer, i) => (
            <AccordionItem key={i} border="none">
              <Transfer transfer={transfer} removeTransfer={removeTransfer} />
            </AccordionItem>
          ))}
        </Accordion>
      ) : null}
      {completedTransfers.length ? (
        <Flex justify="space-between" align="center" my="4">
          <Heading
            as="h4"
            size="sm"
            fontWeight="600"
            letterSpacing="1"
            fontSize="sm"
            color="element.secondary"
            textTransform="uppercase"
          >
            ✅&nbsp;&nbsp;Completed Transfers
          </Heading>
          <IconButton
            aria-label="Completed rescue transfers"
            variant="tertiary"
            color="element.tertiary"
            icon={
              <ChevronUpIcon
                h={8}
                w={8}
                transform={`rotate(${
                  showCompletedTransfers ? '-180deg' : '0deg'
                })`}
                transition="transform 0.3s ease"
              />
            }
            onClick={() => setShowCompletedTransfers(!showCompletedTransfers)}
          />
        </Flex>
      ) : null}
      {completedTransfers.length && showCompletedTransfers ? (
        <Accordion allowMultiple>
          {completedTransfers.map((transfer, i) => (
            <AccordionItem key={i} border="none">
              <Transfer transfer={transfer} removeTransfer={removeTransfer} />
            </AccordionItem>
          ))}
        </Accordion>
      ) : null}

      {remainingStringTransfers.length ? (
        <Heading
          as="h4"
          size="sm"
          my="8"
          fontWeight="600"
          letterSpacing="1"
          fontSize="sm"
          color="element.secondary"
          textTransform="uppercase"
        >
          ⏩&nbsp;&nbsp;Remaining Transfers
        </Heading>
      ) : null}
      <Reorder.Group
        as="section"
        axis="y"
        values={remainingStringTransfers}
        onReorder={setRemainingStringTransfers}
      >
        {remainingStringTransfers.map(stringTransfer => (
          <Reorder.Item
            as="div"
            key={stringTransfer}
            value={stringTransfer}
            onPointerUp={handlePointerUp}
          >
            <Transfer
              transfer={JSON.parse(stringTransfer)}
              removeTransfer={removeTransfer}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <Box h="2" />
    </>
  )
}
