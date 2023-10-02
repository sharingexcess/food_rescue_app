import { CalendarIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Spinner,
} from '@chakra-ui/react'

import { PageTitle } from 'components'
import { formatTimestamp } from 'helpers'
import { useApi } from 'hooks'
import { useEffect, useMemo, useState } from 'react'
import { EntryCard } from '../WholesaleEntry/WholesaleEntryCard'

export function WholesaleAllocationCompleted() {
  const url_params = new URLSearchParams(window.location.search)
  const [date, setDate] = useState(
    formatTimestamp(url_params.get('date') || new Date(), 'YYYY-MM-DD')
  )

  const [statusFilter, setStatusFilter] = useState('completed')
  const [isLoading, setIsLoading] = useState(true) // Add a loading state

  const { data: rescues } = useApi(
    '/rescues/list',
    useMemo(
      () => ({
        type: 'wholesale',
        date_range_start: date,
        date_range_end: date,
        status: 'completed',
      }),
      [date, 'completed']
    )
  )

  useEffect(() => {
    if (rescues) {
      setIsLoading(false)
    }
  }, [rescues])

  function handleChangeDate(e) {
    e.preventDefault()

    setDate(e.target.value)
  }

  return (
    <>
      <PageTitle>Completed Distributions</PageTitle>
      <Flex justifyContent={'space-between'}>
        <Select
          w="128px"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          fontSize="sm"
          color="element.secondary"
          mr="2"
        >
          <option value="completed">Organizations</option>
          <option value="cancelled">Vendors</option>
        </Select>
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
    </>
  )
}
