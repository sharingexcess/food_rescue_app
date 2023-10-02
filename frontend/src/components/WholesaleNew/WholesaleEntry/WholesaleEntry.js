import { useApi, useAuth } from 'hooks'
import { useState, useMemo, useEffect } from 'react'
import { formatTimestamp, STATUSES } from 'helpers'
import {
  Box,
  Flex,
  Spinner,
  InputGroup,
  Input,
  InputRightElement,
  Text,
} from '@chakra-ui/react'
import { PageTitle, FooterButton } from 'components'
import { EntryCard } from './WholesaleEntryCard'
import { useNavigate } from 'react-router-dom'
import { CalendarIcon } from '@chakra-ui/icons'

export function WholesaleEntry() {
  const { hasAdminPermission } = useAuth()
  const [statusFilter] = useState(STATUSES.ACTIVE)

  const navigate = useNavigate()

  const [date, setDate] = useState(formatTimestamp(new Date(), 'YYYY-MM-DD'))
  const [isLoading, setIsLoading] = useState(true)
  const { data: rescues } = useApi(
    '/rescues/list',
    useMemo(
      () => ({
        type: 'wholesale',
        date_range_start: date,
        date_range_end: date,
      }),
      [date, statusFilter]
    )
  )

  useEffect(() => {
    if (rescues) {
      setIsLoading(false)
    }
  }, [rescues])

  function handleCreateNewRescue() {
    navigate(`/wholesale-new/entry/create`)
  }

  function handleChangeDate(event) {
    const dateValue = event.target.value
      ? formatTimestamp(event.target.value, 'YYYY-MM-DD')
      : formatTimestamp(new Date(), 'YYYY-MM-DD')
    setDate(dateValue)
  }

  function formatDate(input) {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]

    const [year, month, day] = input.split('-').map(Number)

    // Create a new Date using the correct format to avoid the zero-based month issue
    const date = new Date(year, month - 1, day)

    const dayOfWeek = days[date.getDay()]
    const monthName = months[date.getMonth()]
    const dayOfMonth = date.getDate()

    let suffix = 'th'
    switch (dayOfMonth) {
      case 1:
      case 21:
      case 31:
        suffix = 'st'
        break
      case 2:
      case 22:
        suffix = 'nd'
        break
      case 3:
      case 23:
        suffix = 'rd'
        break
    }

    return `${dayOfWeek} ${monthName} ${dayOfMonth}${suffix}, ${year}`
  }

  return (
    <>
      <PageTitle>Entry</PageTitle>
      <Flex flexDirection={'column'}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Text fontWeight={'bold'}>{formatDate(date)}</Text>
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

        <Box>
          {isLoading ? (
            <Spinner />
          ) : (
            rescues &&
            rescues
              .filter(rescue => rescue.status === statusFilter)
              .map(rescue => <EntryCard key={rescue.id} rescue={rescue} />)
          )}
        </Box>
      </Flex>

      {hasAdminPermission && (
        <>
          <>
            <FooterButton
              position="fixed"
              bottom="8"
              onClick={() => handleCreateNewRescue()}
            >
              New Rescue
            </FooterButton>
          </>
        </>
      )}
    </>
  )
}
