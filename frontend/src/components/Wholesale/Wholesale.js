import { ArrowRightIcon, CalendarIcon } from '@chakra-ui/icons'
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
import { formatTimestamp } from 'helpers'
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

  useEffect(() => {
    date && window.history.replaceState(null, '', `/wholesale?date=${date}`)
  }, [date])

  function handleChangeDate(event) {
    const dateValue = event.target.value
      ? formatTimestamp(event.target.value, 'YYYY-MM-DD')
      : ''
    setDate(dateValue)
  }

  return (
    <>
      <PageTitle>Wholesale</PageTitle>
      <Flex w="100%" justify="space-between" align="center" mb="4">
        <Heading size="md" flexBasis="50%">
          {formatTimestamp(date, 'dddd, MMM. DD')}
        </Heading>
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
          rescues.map((rescue, i) => (
            <Fragment key={i}>
              <WholesaleRescueCard rescue={rescue} />
              {i < rescues.length - 1 && <Divider />}
            </Fragment>
          ))
        ) : (
          <Flex direction="column" align="center" justify="center" my="12">
            <ArrowRightIcon fontSize="4xl" color="se.brand.primary" mb="8" />
            <Heading as="h4" mb="2">
              Let's get to work!
            </Heading>
            <Text color="element.secondary">
              Add a donation below to begin.
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
          />
        </>
      )}
    </>
  )
}
