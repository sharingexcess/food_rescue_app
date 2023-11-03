import { CalendarIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Spinner,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  useColorModeValue,
  Link,
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
  const [distributions, setDistributions] = useState([])

  const DistributionCard = ({ data }) => {
    const cardBg = useColorModeValue('gray.100', 'gray.700')

    const handleCardClick = () => {
      window.location.href = `/wholesale-new/allocation/create?edit=${data.id}`
    }

    return (
      <Box
        bg={cardBg}
        p={5}
        borderRadius="md"
        boxShadow="md"
        mb={4}
        mt={4}
        onClick={handleCardClick}
        _hover={{
          cursor: 'pointer',
          bg: useColorModeValue('gray.200', 'gray.600'),
        }} // Optional: Add hover effect
        cursor={{ cursor: 'pointer' }}
      >
        <VStack align="stretch" spacing={4}>
          <HStack justifyContent="space-between">
            <Text fontWeight="bold">Distribution ID:</Text>
            <Badge colorScheme="green">{data.rescue_id}</Badge>
          </HStack>
          <Divider />
          <HStack justifyContent="space-between">
            <Text fontWeight="bold">Status:</Text>
            <Text>{data.status}</Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text fontWeight="bold">Total Weight:</Text>
            <Text>{data.total_weight} lbs</Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text fontWeight="bold">Organization:</Text>
            <Text>{data.organization.name}</Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text fontWeight="bold">Location:</Text>
            <Text>
              {data.location.nickname} - {data.location.city}
            </Text>
          </HStack>
          <Divider />
          <Text fontSize="sm">
            Completed on: {new Date(data.timestamp_completed).toLocaleString()}
          </Text>
        </VStack>
      </Box>
    )
  }

  const { data: rescues } = useApi(
    '/rescues/list',
    useMemo(
      () => ({
        type: 'wholesale',
        date_range_start: new Date(
          new Date().setDate(new Date().getDate() - 7)
        ),
        date_range_end: date,
        status: selectedOption === 'vendors' ? 'completed' : '',
      }),
      [date, selectedOption]
    )
  )

  useEffect(() => {
    if (rescues) {
      setIsLoading(false)
      // Initialize an array to hold the filtered transfers
      const filteredTransfers = []

      if (selectedOption === 'organizations') {
        rescues.forEach(rescue => {
          if (rescue.status !== 'cancelled') {
            rescue.transfers.forEach(transfer => {
              if (
                transfer.type === 'distribution' &&
                transfer.status === 'completed'
              ) {
                // Instead of logging, push the transfer to the array
                filteredTransfers.push(transfer)
              }
            })
          }
        })
      }

      // Sort the filtered transfers by timestamp_completed in descending order
      filteredTransfers.sort((a, b) => {
        return new Date(b.timestamp_completed) - new Date(a.timestamp_completed)
      })

      // Update the state with the sorted and filtered transfers
      setDistributions(filteredTransfers)
    }
  }, [rescues, selectedOption])

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
          : 'Completed Allocations'}
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
          rescues.map(rescue =>
            selectedOption === 'vendors' ? (
              <EntryCard key={rescue.id} rescue={rescue} />
            ) : (
              <div>
                {distributions.map(transfer => (
                  <DistributionCard key={transfer.id} data={transfer} />
                ))}
              </div>
            )
          )
        )}
      </Box>
    </>
  )
}
