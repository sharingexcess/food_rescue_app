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
  ORG_SUBTYPES,
  STATUSES,
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
    '/rescues',
    useMemo(() => ({ type: 'wholesale', date: date }), [date])
  )

  const totalPounds = useMemo(() => {
    let total = 0
    for (const rescue of rescues || []) {
      for (const stop of rescue.stops.filter(s => s.type === 'delivery')) {
        total += stop.impact_data_total_weight
      }
    }
    return total
  })

  const totalDonated = useMemo(() => {
    let total = 0
    for (const rescue of rescues || []) {
      for (const stop of rescue.stops.filter(
        s =>
          s.type === 'delivery' &&
          s.organization.subtype !== ORG_SUBTYPES.COMPOST
      )) {
        total += stop.impact_data_total_weight
      }
    }
    return total
  })

  console.log(totalPounds, totalDonated)

  useEffect(() => {
    date && window.history.replaceState(null, '', `/wholesale?date=${date}`)
  }, [date])

  function handleChangeDate(event) {
    console.log(event.target.value)
    const dateValue = event.target.value
      ? formatTimestamp(event.target.value, 'YYYY-MM-DD')
      : formatTimestamp(new Date(), 'YYYY-MM-DD')
    setDate(dateValue)
  }

  return (
    <>
      <PageTitle>Wholesale</PageTitle>
      <Flex w="100%" justify="space-between" align="center" mb="4">
        <Box>
          <Heading size="md" flexBasis="50%">
            {formatTimestamp(date, 'dddd, MMM. DD')}
          </Heading>
          {totalPounds && totalDonated ? (
            <Text color="element.secondary" fontWeight="300">
              {formatLargeNumber(totalPounds)} lbs. received,{' '}
              {formatLargeNumber(totalDonated)} lbs. donated
            </Text>
          ) : null}
        </Box>
        <InputGroup flexShrink="1" flexBasis="128px">
          <Input
            type="date"
            value={date}
            onChange={e => handleChangeDate(e)}
            fontSize="sm"
            color="element.secondary"
          />
          <InputRightElement pointerEvents="none">
            <CalendarIcon mr="2" color="element.tertiary" />
          </InputRightElement>
        </InputGroup>
      </Flex>
      {rescues ? (
        rescues.length ? (
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
      <Box h="16" />

      {hasAdminPermission && (
        <>
          <FooterButton onClick={() => setAddDonation(true)}>
            Add Donation
          </FooterButton>
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
