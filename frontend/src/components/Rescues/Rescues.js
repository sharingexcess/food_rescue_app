import {
  Button,
  Flex,
  Heading,
  IconButton,
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

export function Rescues({ setTitle }) {
  useEffect(() => setTitle('test'), [])
  const { hasAdminPermission } = useAuth()
  const url_params = new URLSearchParams(window.location.search)

  const [handler, setHandler] = useState()
  const [date, setDate] = useState()
  const [status, setStatus] = useState(url_params.get('status') || 'scheduled')
  const [cachedScrollPosition, setCachedScrollPosition] = useState(null)

  const api_params = useMemo(
    () => ({
      status: status === 'available' ? 'scheduled' : status,
      handler_id: status === 'available' ? 'null' : handler ? handler.id : null,
      date: date,
      limit: 10,
    }),
    [date, handler, status]
  )

  const { data, loading, loadMore } = useApi('/rescues', api_params)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('status', status)
    params.set(
      'handler_id',
      status === 'available' ? 'null' : handler?.id || ''
    )
    params.set('date', date)
    params.set('handler_name', handler?.name || '')
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${params.toString()}`
    )
  }, [date, handler, status])

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

  return (
    <>
      <Flex justify="space-between" w="100%">
        <PageTitle mb="6">Rescues</PageTitle>
        {hasAdminPermission && (
          <Link to="/create-rescue">
            <IconButton icon={<AddIcon />} borderRadius="3xl" />
          </Link>
        )}
      </Flex>
      <Filters
        handler={handler}
        setHandler={setHandler}
        date={date}
        setDate={setDate}
        status={status}
        setStatus={setStatus}
      />
      {loading && !data ? (
        <LoadingRescues />
      ) : data?.length ? (
        <>
          {data.map(rescue => (
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
