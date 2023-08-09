import { CalendarIcon, SearchIcon } from '@chakra-ui/icons'
import {
  Box,
  Divider,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Skeleton,
  Text,
} from '@chakra-ui/react'
import { PageTitle, FooterButton } from 'components'
import {
  formatLargeNumber,
  formatTimestamp,
  STATUSES,
  TRANSFER_TYPES,
} from 'helpers'
import { useApi, useAuth } from 'hooks'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { AddDonation } from './Wholesale.AddDonation'
import { WholesaleRescueCard } from './Wholesale.RescueCard'

export function Wholesale() {
  const url_params = new URLSearchParams(window.location.search)
  const [date, setDate] = useState(
    formatTimestamp(url_params.get('date') || new Date(), 'YYYY-MM-DD')
  )
  const [addDonation, setAddDonation] = useState(false)
  const { hasAdminPermission } = useAuth()
  const { data: rescues, refresh } = useApi(
    '/rescues/list',
    useMemo(
      () => ({
        type: 'wholesale',
        date_range_start: date,
        date_range_end: date,
      }),
      [date]
    )
  )

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
      <PageTitle>Wholesale</PageTitle>
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
      {rescues ? (
        rescues.filter(i =>
          [STATUSES.ACTIVE, STATUSES.COMPLETED].includes(i.status)
        ).length ? (
          rescues
            .filter(i =>
              [STATUSES.ACTIVE, STATUSES.COMPLETED].includes(i.status)
            )
            .map((rescue, i) => (
              <Fragment key={i}>
                <WholesaleRescueCard rescue={rescue} />
                {i < rescues.length - 1 && <Divider />}
              </Fragment>
            ))
        ) : (
          <Flex direction="column" align="center" justify="center" my="12">
            <SearchIcon fontSize="6xl" color="se.brand.primary" mb="8" />
            <Heading as="h4" mb="4" align="center" size="lg">
              Nothing here yet...
            </Heading>
            <Text color="element.secondary" align="center" maxW="360">
              Add a donation below, or use the date picker above to show another
              day.
            </Text>
          </Flex>
        )
      ) : (
        <>
          <Skeleton w="100%" h="32" my="4" />
          <Skeleton w="100%" h="32" my="4" />
          <Skeleton w="100%" h="32" my="4" />
          <Skeleton w="100%" h="32" my="4" />
        </>
      )}
      {hasAdminPermission && (
        <>
          <Flex position="fixed" bottom="10" right="10">
            <FooterButton onClick={() => setAddDonation(true)}>
              New Rescue
            </FooterButton>
          </Flex>
          <AddDonation
            isOpen={addDonation}
            handleClose={() => setAddDonation(false)}
            refresh={refresh}
            defaultDate={date}
          />
        </>
      )}
    </>
  )
}
