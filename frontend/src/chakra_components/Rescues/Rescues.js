import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  Tag,
  Text,
} from '@chakra-ui/react'
import { useApi, useAuth, useIsMobile } from 'hooks'
import { formatTimestamp } from 'helpers'
import { useEffect, useMemo, useState } from 'react'
import { Autocomplete } from 'chakra_components'
import { AddIcon, CalendarIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom'
import moment from 'moment'

export function Rescues({ setTitle }) {
  useEffect(() => setTitle('test'), [])
  const { hasAdminPermission, user } = useAuth()
  const url_params = new URLSearchParams(window.location.search)

  const [handler, setHandler] = useState()
  const [date, setDate] = useState()
  const [status, setStatus] = useState(url_params.get('status') || 'scheduled')
  const [cachedScrollPosition, setCachedScrollPosition] = useState(null)

  function handleChangeDate(event) {
    const dateValue = event.target.value
      ? moment(event.target.value).format('YYYY-MM-DD')
      : ''
    setDate(dateValue)
  }

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

  const { data: handlers } = useApi('/publicProfiles')

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

  function searchForHandler(value) {
    return handlers.filter(i =>
      i.name.toLowerCase().includes(value.toLowerCase())
    )
  }
  return (
    <>
      <Flex justify="space-between" w="100%">
        <Heading
          as="h1"
          fontWeight="700"
          size="2xl"
          mb="24px"
          textTransform="capitalize"
          color="element.primary"
        >
          Rescues
        </Heading>
        {hasAdminPermission && (
          <Link to="/create-rescue">
            <IconButton icon={<AddIcon />} borderRadius="3xl" />
          </Link>
        )}
      </Flex>
      <Flex
        justify="space-between"
        id="RescuesHeaderBox"
        flexWrap={['wrap', 'wrap', 'nowrap', 'nowrap', 'nowrap']}
        gap="4"
      >
        <StatusSelect status={status} setStatus={setStatus} id="Statusselect" />
        <Autocomplete
          placeholder="Handler..."
          value={handler}
          setValue={setHandler}
          handleChange={value => searchForHandler(value)}
          displayField="name"
          id="Autocomplete"
          flexGrow="1"
          flexBasis="128px"
          optionLabel={i => `${i.name} (${i.email})`}
        />
        <InputGroup flexGrow="1" flexBasis="128px">
          <InputLeftElement
            pointerEvents="none"
            children={<CalendarIcon mr="2" color="element.tertiary" />}
          />
          <Input
            type="date"
            value={date}
            onChange={e => handleChangeDate(e)}
            id="Datepicker"
            fontSize="sm"
            color="element.secondary"
          />
        </InputGroup>
      </Flex>
      {loading && !data ? (
        <>
          {['', '', '', ''].map((_, i) => (
            <Skeleton h="32" my="4" borderRadius="md" key={i} />
          ))}
        </>
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
        <Flex direction="column" align="center" w="100%" py="16">
          <Heading as="h4" size="md" color="element.primary" mb="1">
            No rescues to show.
          </Heading>
          <Text align="center" fontSize="sm" color="element.secondary" mb="6">
            There are no rescues that match your current filters.
          </Text>
        </Flex>
      )}
    </>
  )
}

export function RescueCard({ rescue }) {
  return (
    <Link to={`/rescues/${rescue.id}`} className="Rescue-Link">
      <Box
        my={6}
        boxShadow="default"
        borderRadius="md"
        p={4}
        w="100%"
        bg="surface.card"
        cursor="pointer"
      >
        <CardHeader rescue={rescue} />
        <Box h={4} />
        <CardTags rescue={rescue} />
      </Box>
    </Link>
  )
}

function CardHeader({ rescue }) {
  return (
    <Flex align="center">
      <Avatar src={rescue.handler?.icon} name={rescue.handler?.name} />
      <Box w={4} />
      <Flex direction="column">
        <Heading as="h2" size="md" color="element.primary">
          {rescue.handler?.name || 'Available Rescue'}
        </Heading>
        <Text color="element.secondary" fontSize="xs">
          {formatTimestamp(
            rescue.timestamp_scheduled_start,
            'dddd, MMMM DD - h:mma'
          )}
        </Text>
      </Flex>
    </Flex>
  )
}

function CardTags({ rescue }) {
  const isMobile = useIsMobile()

  return (
    <Flex wrap="wrap" noOfLines={2}>
      {rescue.stops.map(stop => (
        <Tag
          key={stop.id}
          size="sm"
          bg={stop.type === 'pickup' ? 'blue.secondary' : 'green.secondary'}
          color={stop.type === 'pickup' ? 'blue.primary' : 'green.primary'}
          borderRadius="xl"
          flexShrink={0}
          mr="1"
        >
          {stop.organization.name.length > 13 && isMobile
            ? stop.organization.name.substr(0, 13) + '...'
            : stop.organization.name}
        </Tag>
      ))}
    </Flex>
  )
}

function StatusSelect({ status, setStatus }) {
  return (
    <Select
      onChange={e => setStatus(e.target.value)}
      value={status}
      flexBasis={['100%', '100%', '180px', '180px', '180px']}
    >
      <option value="available">Available</option>
      <option value="scheduled">Scheduled</option>
      <option value="active">Active</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </Select>
  )
}

function TabButton({ label }) {
  return (
    <Button variant="outline">
      <Text fontSize="md" col>
        {label}
      </Text>
    </Button>
  )
}

function TabButtons() {
  return (
    <Flex justify="start">
      <TabButton label={'Scheduled'} />
      <TabButton label={'Active'} />
      <TabButton label={'Completed'} />
      <TabButton label={'Cancelled'} />
    </Flex>
  )
}
