import {
  Button,
  Flex,
  Heading,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Skeleton,
  Text,
} from '@chakra-ui/react'
import { useApi, useAuth } from 'hooks'
import { useEffect, useMemo, useState } from 'react'
import { PageTitle } from 'components'
import { AddIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom'
import { RescueCard } from './Rescues.Card'
import { Filters } from './Rescues.Filters'
import { STATUSES } from 'helpers'

export function Rescues() {
  const { hasAdminPermission } = useAuth()
  const url_params = new URLSearchParams(window.location.search)

  const [handler, setHandler] = useState()
  const [date, setDate] = useState(url_params.get('date_range_start') || '')
  const [status, setStatus] = useState(url_params.get('status') || 'scheduled')
  const [type, setType] = useState(url_params.get('type') || 'retail')
  const [cachedScrollPosition, setCachedScrollPosition] = useState(null)

  const api_params = useMemo(
    () => ({
      type,
      status: status === 'available' ? 'scheduled' : status,
      handler_id: status === 'available' ? 'null' : handler ? handler.id : null,
      date_range_start: date,
      date_range_end: date,
      limit: 10,
    }),
    [date, handler, status, type]
  )

  const { data, loading, loadMore } = useApi('/rescues/list', api_params)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('status', status)
    params.set('type', type)
    params.set(
      'handler_id',
      status === 'available' ? 'null' : handler?.id || ''
    )
    params.set('date_range_start', date)
    params.set('date_range_end', date)
    params.set('handler_name', handler?.name || '')
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${params.toString()}`
    )
  }, [date, handler, status, type])

  // this useEffect returns to the pre-update scroll position
  // when new rescues are loaded so users don't lose their place
  useEffect(() => {
    if (!loading && cachedScrollPosition) {
      window.scrollTo(0, cachedScrollPosition)
      setCachedScrollPosition(null)
    }
  }, [loading, cachedScrollPosition])

  function handleLoadMore() {
    // store the current scroll position to return to after loading new rescues
    setCachedScrollPosition(window.scrollY)
    loadMore()
  }

  function sortRescuesByStatus(rescues) {
    if ([STATUSES.COMPLETED, STATUSES.CANCELLED].includes(status)) {
      return rescues
    } else return rescues.reverse()
  }

  return (
    <>
      <Flex justify="space-between" w="100%">
        <PageTitle mb="6">Rescues</PageTitle>
        {hasAdminPermission && (
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <IconButton icon={<AddIcon />} borderRadius="3xl" />
            </PopoverTrigger>
            <Portal>
              <PopoverContent w="42">
                <PopoverArrow />
                <Flex direction="column" px="4" py="3" gap="2" align="flex-end">
                  <Link to="/schedule-rescue">Schedule Rescue</Link>
                  <Link to="/log-rescue">Log Past Rescue</Link>
                </Flex>
              </PopoverContent>
            </Portal>
          </Popover>
        )}
      </Flex>
      <Filters
        handler={handler}
        setHandler={setHandler}
        date={date}
        setDate={setDate}
        status={status}
        setStatus={setStatus}
        type={type}
        setType={setType}
      />
      {loading && !data ? (
        <LoadingRescues />
      ) : data?.length ? (
        <>
          {sortRescuesByStatus(data).map(rescue => (
            <RescueCard rescue={rescue} key={rescue.id} />
          ))}
          <Flex width="100%" my="4" justify="center">
            <Button
              variant="primary"
              onClick={handleLoadMore}
              disabled={!loadMore || loading}
            >
              Load More
            </Button>
          </Flex>
        </>
      ) : (
        <NoRescues />
      )}
    </>
  )
}

function NoRescues() {
  return (
    <Flex direction="column" align="center" w="100%" py="16">
      <Heading as="h4" size="md" color="element.primary" mb="1">
        No rescues to show.
      </Heading>
      <Text align="center" fontSize="sm" color="element.secondary" mb="6">
        There are no rescues that match your current filters.
      </Text>
    </Flex>
  )
}

function LoadingRescues() {
  return (
    <>
      <Skeleton h="32" my="4" borderRadius="md" />
      <Skeleton h="32" my="4" borderRadius="md" />
      <Skeleton h="32" my="4" borderRadius="md" />
      <Skeleton h="32" my="4" borderRadius="md" />
    </>
  )
}
