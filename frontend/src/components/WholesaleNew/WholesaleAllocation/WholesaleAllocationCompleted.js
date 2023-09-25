import { CalendarIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  List,
  ListItem,
  Badge,
  VStack,
  HStack,
} from '@chakra-ui/react'

import { PageTitle } from 'components'
import {
  formatLargeNumber,
  formatTimestamp,
  STATUSES,
  TRANSFER_TYPES,
} from 'helpers'
import { useApi } from 'hooks'
import { useEffect, useMemo, useState } from 'react'

export function WholesaleAllocationCompleted() {
  const url_params = new URLSearchParams(window.location.search)
  const [date, setDate] = useState(
    formatTimestamp(url_params.get('date') || new Date(), 'YYYY-MM-DD')
  )
  const { data: rescues } = useApi(
    '/rescues/list',
    useMemo(
      () => ({
        type: 'wholesale',
        date_range_start: date,
        date_range_end: date,
        status: 'completed',
      }),
      [date]
    )
  )

  const distributionTransfers = useMemo(() => {
    if (!rescues) return []
    return rescues
      .flatMap(rescue => rescue.transfers || [])
      .filter(transfer => transfer.type === 'distribution')
  }, [rescues])

  useEffect(() => {
    if (distributionTransfers) {
      console.log(distributionTransfers)
    }
  }, [distributionTransfers])

  const totalPounds = useMemo(() => {
    let total = 0
    for (const rescue of rescues || []) {
      for (const transfer of rescue.transfers.filter(
        s =>
          s.type === TRANSFER_TYPES.COLLECTION &&
          s.status !== STATUSES.CANCELLED
      )) {
        total += transfer.total_weight
      }
    }
    return total
  })

  const totalDonated = useMemo(() => {
    let total = 0
    for (const rescue of rescues || []) {
      for (const transfer of rescue.transfers.filter(
        s => s.type === TRANSFER_TYPES.DISTRIBUTION
      )) {
        total += transfer.total_weight
      }
    }
    return total
  })

  useEffect(() => {
    date && window.history.replaceState(null, '', `/wholesale?date=${date}`)
  }, [date])

  function handleChangeDate(event) {
    const dateValue = event.target.value
      ? formatTimestamp(event.target.value, 'YYYY-MM-DD')
      : formatTimestamp(new Date(), 'YYYY-MM-DD')
    setDate(dateValue)
  }

  return (
    <>
      <PageTitle>Completed Distributions</PageTitle>
      <Flex w="100%" justify="space-between" align="top" mb="4">
        <Box pt="2">
          <Heading size="md" flexBasis="50%">
            {formatTimestamp(date, 'dddd, MMM. DD')}
          </Heading>
          <Text fontSize="xs" color="element.secondary" fontWeight="300" mt="1">
            {formatLargeNumber(totalPounds)} lbs. collected{' | '}
            {formatLargeNumber(totalDonated)} lbs. distributed
          </Text>
        </Box>
        <InputGroup flexShrink="1" flexGrow="0" flexBasis="96px">
          <Input
            type="date"
            value={date}
            onChange={e => handleChangeDate(e)}
            fontSize="sm"
            color="element.secondary"
            w="128px"
          />
          <InputRightElement pointerEvents="none">
            <CalendarIcon mr="2" color="element.tertiary" />
          </InputRightElement>
        </InputGroup>
      </Flex>
      {distributionTransfers.length > 0 ? (
        <>
          <List spacing={3} colorScheme="teal">
            {distributionTransfers.map((distributionTransfer, index) => (
              <Box
                mt={4}
                p={6}
                borderWidth="1px"
                borderRadius="lg"
                boxShadow="md"
                overflow="hidden"
                key={index}
              >
                <VStack align="start" spacing={5}>
                  <HStack spacing={4}>
                    <Badge colorScheme="teal" fontSize="0.8em">
                      {distributionTransfer.status.toUpperCase()}
                    </Badge>
                    <Text fontSize="xs">
                      {new Date(
                        distributionTransfer.timestamp_created
                      ).toLocaleString()}
                    </Text>
                  </HStack>

                  <Heading size="md">
                    {distributionTransfer.organization.name}
                  </Heading>

                  <List spacing={2}>
                    <ListItem>
                      <strong>Distributon Percentage: </strong>
                      {distributionTransfer.percent_of_total_dropped}%
                    </ListItem>
                  </List>
                </VStack>
              </Box>
            ))}
          </List>
        </>
      ) : (
        <Box mt={4} p={4} borderWidth="1px" borderRadius="lg" boxShadow="lg">
          <Text color="white.500">Loading distributions...</Text>
        </Box>
      )}
    </>
  )
}
