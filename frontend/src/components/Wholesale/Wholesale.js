import { CalendarIcon } from '@chakra-ui/icons'
import {
  Divider,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Skeleton,
} from '@chakra-ui/react'
import { PageTitle, FooterButton } from 'components'
import { formatTimestamp } from 'helpers'
import { useApi, useAuth } from 'hooks'
import { Fragment, useMemo, useState } from 'react'
import { AddDonation } from './Wholesale.AddDonation'
import { WholesaleRescueCard } from './Wholesale.RescueCard'

export function Wholesale() {
  const [date, setDate] = useState(formatTimestamp(new Date(), 'YYYY-MM-DD'))
  const [addDonation, setAddDonation] = useState(false)
  const { hasAdminPermission } = useAuth()
  const { data: rescues, refresh } = useApi(
    '/rescues',
    useMemo(() => ({ type: 'wholesale', date: date }), [date])
  )

  function handleChangeDate(date) {
    setDate(date || '')
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
        rescues.map((rescue, i) => (
          <Fragment key={i}>
            <WholesaleRescueCard rescue={rescue} />
            {i < rescues.length - 1 && <Divider />}
          </Fragment>
        ))
      ) : (
        <>
          <Skeleton w="100%" h="32" my="4" />
          <Skeleton w="100%" h="32" my="4" />
          <Skeleton w="100%" h="32" my="4" />
          <Skeleton w="100%" h="32" my="4" />
        </>
      )}

      {hasAdminPermission && (
        <FooterButton onClick={() => setAddDonation(true)}>
          Add Donation
        </FooterButton>
      )}
      <AddDonation
        isOpen={addDonation}
        handleClose={() => setAddDonation(false)}
        refresh={refresh}
      />
    </>
  )
}
