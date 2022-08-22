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
import { STATUSES } from 'helpers'
import { useEffect, useState } from 'react'
import { StopButtons } from './Rescue.StopButtons'
import { statusIcon } from './Rescue.utils'

export function InactiveStop({ stop }) {
  const [isExpanded, setIsExpanded] = useState()

  // close the stop whenever it's updated from inside the card overlay
  useEffect(() => setIsExpanded(false), [stop])

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
          {statusIcon(stop.status)}&nbsp;&nbsp;{stop.type}
          {stop.status === STATUSES.COMPLETED
            ? ` (${stop.impact_data_total_weight} lbs.)`
            : ''}
        </Heading>
        <IconButton
          aria-label="Rescue stop"
          variant="tertiary"
          color="element.tertiary"
          icon={
            <ChevronUpIcon
              h={8}
              w={8}
              transform={`rotate(${open ? '-180deg' : '0deg'})`}
              transition="transform 0.3s ease"
            />
          }
          onClick={toggleIsExpanded}
        />
      </Flex>

      <Heading as="h3" size="md" fontWeight="600" color="element.primary">
        {stop.organization.name}
      </Heading>
      <Text as="p" fontWeight="300" color="element.secondary">
        {stop.location.nickname || stop.location.address1}
      </Text>
      <Box h={4} />
      <Collapse in={isExpanded} startingHeight={0} endingHeight={120}>
        <StopButtons stop={stop} />
      </Collapse>
      <Divider orientation="horizontal" />
    </Box>
  )
}
