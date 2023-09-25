import { useApi, useAuth } from 'hooks'
import { useState, useMemo, useEffect } from 'react'
import {
  formatTimestamp,
  STATUSES,
  calculateCurrentLoad,
  formatDate,
} from 'helpers'
import {
  Box,
  Flex,
  Spinner,
  InputGroup,
  Input,
  InputRightElement,
  Text,
  Divider,
} from '@chakra-ui/react'
import { PageTitle, FooterButton } from 'components'
import { EntryCard } from '../WholesaleEntry/WholesaleEntryCard'
import { useNavigate } from 'react-router-dom'
import { CalendarIcon } from '@chakra-ui/icons'

export function WholesaleRemaining() {
  const url_params = new URLSearchParams(window.location.search)
  const { hasAdminPermission } = useAuth()
  const [statusFilter] = useState(STATUSES.SCHEDULED)

  const navigate = useNavigate()

  const [date, setDate] = useState(
    formatTimestamp(url_params.get('date') || new Date(), 'YYYY-MM-DD')
  )

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

  return (
    <>
      <PageTitle>Remaining / Scheduled</PageTitle>
      <Flex flexDirection={'column'}>
        <Flex justifyContent={'space-between'}>
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

      {rescues &&
        rescues &&
        rescues
          .filter(rescue =>
            rescue.transfers.some(transfer => transfer.organization.name)
          )
          .map(rescue =>
            rescue.transfers
              .filter(transfer => transfer.type === 'collection')
              .map(transfer => {
                const currentLoad = calculateCurrentLoad(rescue)
                if (currentLoad === 0 || currentLoad < 0) return null // Do not display if the weight is 0
                return (
                  <Box key={`${rescue.id}-${transfer.id}`}>
                    <Flex
                      key={`${rescue.id}-${transfer.id}`}
                      mb={6}
                      mt={6}
                      cursor="pointer"
                      align={'center'}
                    >
                      <Text fontWeight={'bold'} fontSize={28} mr={2}>
                        {transfer.organization.name}
                      </Text>
                      <Text mr={2}>| {transfer.product_type}</Text>|{' '}
                      {currentLoad} lbs.
                      <Text ml={2} fontWeight={'200'}>
                        | {formatDate(rescue.timestamp_created) || ''}
                      </Text>
                    </Flex>
                    <Divider />
                  </Box>
                )
              })
          )}

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
