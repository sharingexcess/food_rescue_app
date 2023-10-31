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

  const [selectedOption, setSelectedOption] = useState('vendors')
  const [isLoading, setIsLoading] = useState(true)

  const { data: rescues } = useApi(
    '/rescues/list',
    useMemo(
      () => ({
        type: 'wholesale',
        date_range_start: date,
        date_range_end: date,
        status: selectedOption === 'vendors' ? 'completed' : 'active',
      }),
      [date, selectedOption]
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

  function handleSelectChange(e) {
    setSelectedOption(e.target.value)
  }

  return (
    <>
      <PageTitle>
        {selectedOption === 'vendors'
          ? 'Completed Allocations'
          : 'Active Allocations'}
      </PageTitle>
      <Flex justifyContent={'space-between'}>
        <Select
          w="128px"
          value={selectedOption}
          onChange={handleSelectChange}
          fontSize="sm"
          color="element.secondary"
          mr="2"
        >
          <option value="vendors">Vendors</option>
          <option value="organizations">Organizations</option>
        </Select>
        <InputGroup flexShrink="1" flexGrow="0" flexBasis="96px">
          <Input
            type="date"
            value={date}
            onChange={handleChangeDate}
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
          rescues.map(rescue => <EntryCard key={rescue.id} rescue={rescue} />)
        )}
      </Box>
    </>
  )
}
