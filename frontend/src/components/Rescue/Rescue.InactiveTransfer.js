import { ChevronUpIcon } from '@chakra-ui/icons'
import {
  Box,
  Collapse,
  Divider,
  Flex,
  Heading,
  IconButton,
  Text,
} from '@chakra-ui/react'
import { STATUSES, TRANSFER_TYPES } from 'helpers'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { TransferButtons } from './Rescue.TransferButtons'
import { statusIcon } from './Rescue.utils'

export function InactiveTransfer({ transfer }) {
  const [isExpanded, setIsExpanded] = useState()

  // close the transfer whenever it's updated from inside the card overlay
  useEffect(() => setIsExpanded(false), [transfer])

  function toggleIsExpanded() {
    setIsExpanded(!isExpanded)
  }

  return (
    <Box px="4" my="3">
      <Flex justify={'space-between'} align="center">
        <Heading
          as="h6"
          fontWeight="600"
          letterSpacing={1}
          fontSize="sm"
          color="element.tertiary"
          textTransform="uppercase"
          py="2"
        >
          {statusIcon(transfer.status)}&nbsp;&nbsp;
          <Text
            as="span"
            color={
              transfer.type === TRANSFER_TYPES.COLLECTION
                ? 'blue.primary'
                : 'green.primary'
            }
          >
            {transfer.type}
          </Text>
          {transfer.status === STATUSES.COMPLETED
            ? ` | ${transfer.total_weight} lbs.`
            : ''}
        </Heading>
        <IconButton
          aria-label="Rescue transfer"
          variant="tertiary"
          color="element.tertiary"
          icon={
            <ChevronUpIcon
              h={8}
              w={8}
              transform={`rotate(${isExpanded ? '-180deg' : '0deg'})`}
              transition="transform 0.3s ease"
            />
          }
          onClick={toggleIsExpanded}
        />
      </Flex>
      <Heading as="h3" size="md" fontWeight="600" color="element.primary">
        {transfer.organization.name}
      </Heading>
      <Text as="p" fontWeight="300" color="element.secondary">
        {transfer.location.nickname || transfer.location.address1}
      </Text>
      {transfer.timestamp_completed && (
        <Text
          as="aside"
          fontSize="xs"
          fontWeight="400"
          color="element.tertiary"
        >
          Completed:{' '}
          {moment(transfer.timestamp_completed).format('dddd M/DD - h:mma')}
        </Text>
      )}
      <Box h={4} />
      <Collapse in={isExpanded} startingHeight={0} endingHeight={120}>
        <TransferButtons transfer={transfer} />
      </Collapse>
      <Divider orientation="horizontal" />
    </Box>
  )
}
