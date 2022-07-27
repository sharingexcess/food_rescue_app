import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Select,
  Tag,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import axios from 'axios'
import { useApi, useAuth, useFirestore, useIsMobile } from 'hooks'
import { API_ENDPOINTS, formatTimestamp, SE_API, STATUSES } from 'helpers'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Page } from 'chakra_components'
import moment from 'moment'

export function Rescues() {
  const { admin, user } = useAuth()
  // const navigate = useNavigate()
  const url_params = new URLSearchParams(window.location.search)
  console.log('status:', url_params.get('status'))

  // const [status, setStatus] = useState(url_params.get('status') || 'scheduled')

  // const query = useQuery(['rescues'], async () => {
  //   const token = await user.accessToken
  //   if (!token) {
  //     console.log('no access token')
  //     return
  //   }
  //   console.log('running fetch', `${API_URL}/rescues?limit=5&status=scheduled`)
  //   const res = await axios.get(`${API_URL}/rescues?limit=5&status=scheduled`)
  //   console.log(res)
  //   return res
  // })

  // FROM OLD RESCUES
  const handlers = useFirestore('users')

  // console.log(query)

  // const { data, refetch } = query

  // useEffect(() => {
  //   // const params = new URLSearchParams({ status, limit })
  //   // navigate('/chakra/rescues?' + params.toString(), undefined, {
  //   //   shallow: true,
  //   // })
  //   console.log('refetching')
  //   refetch()
  // }, [status, user])

  // FROM OLD RESCUES
  const [state, setState] = useState({
    status: url_params.get('status') || STATUSES.SCHEDULED,
    handler_id: admin ? url_params.get('handler_id') || '' : user.id, // ensure that non-admins can't fetch data by transforming the url
    date: '', // url_params.get('date') ||
    limit: 10,
    handler_name: admin ? url_params.get('handler_name') || '' : user.name,
    handler_suggestions: null,
    scroll_position: null,
    status: 'scheduled',
  })

  const api_params = useMemo(
    () => ({
      status: state.status === 'available' ? 'scheduled' : state.status,
      handler_id: state.status === 'available' ? 'null' : state.handler_id, // this is a weird edge case, yes we in fact need to use the string "null" here.
      date: state.date,
      limit: state.limit,
    }),
    [state.status, state.handler_id, state.date, state.limit]
  )

  const { data, loading, loadMore, refresh, error } = useApi(
    '/rescues',
    api_params
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('status', state.status)
    params.set('handler_id', state.handler_id)
    params.set('date', state.date)
    params.set('handler_name', state.handler_name)
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${params.toString()}`
    )
  }, [state])
  // FROM OLD RESCUES

  function handleChangeHandler(event) {
    const search_value = event.target.value
    const suggestions = handlers.filter(i =>
      i.name.toLowerCase().includes(search_value.toLowerCase())
    )
    setState({
      ...state,
      handler_name: search_value,
      handler_suggestions: suggestions,
    })
  }

  function handleChangeDate(event) {
    const date = event.target.value
      ? moment(event.target.value).format('YYYY-MM-DD')
      : ''
    setState({ ...state, date })
  }

  function handleSelectHandler(selected) {
    setState({
      ...state,
      handler_id: selected.id,
      handler_name: selected.name,
      handler_suggestions: null,
    })
  }

  function handleClearHandler() {
    setState({
      ...state,
      handler_name: '',
      handler_id: '',
      handler_suggestions: null,
    })
  }

  return (
    <Page
      id="Rescues"
      title="Rescues"
      breadcrumbs={[{ label: 'Rescues', link: '/chakra/rescues' }]}
    >
      <TabButtons />
      <Flex justify="space-between">
        <Input
          variant="flushed"
          placeholder="Volunteer"
          suggestions={state.handler_suggestions}
          onChange={handleChangeHandler}
        />
        <Input
          placeholder="MM/DD/YYYY"
          type="date"
          variant="flushed"
          onChange={handleChangeDate}
        />
      </Flex>
      {/* <StatusSelect status={status} setStatus={setStatus} /> */}
      {data &&
        data.map(rescue => <RescueCard rescue={rescue} key={rescue.id} />)}
    </Page>
  )
}

function RescueCard({ rescue }) {
  const cardColor = useColorModeValue('card-light', 'card-dark')

  return (
    <Link to={`/chakra/rescues/${rescue.id}`}>
      <Box
        my={6}
        boxShadow="md"
        borderRadius="md"
        p={4}
        w="100%"
        bg={cardColor}
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
  const subtextColor = useColorModeValue('gray.400', 'gray.500')
  return (
    <Flex align="center">
      <Avatar
        src={rescue.handler?.icon}
        name={rescue.handler?.name}
        bg="gray.400"
        color="white"
      />
      <Box w={4} />
      <Flex direction="column">
        <Heading as="h4" size="md">
          {rescue.handler?.name || 'Available Rescue'}
        </Heading>
        <Text color={subtextColor} fontSize="xs">
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
  const greenTextColor = useColorModeValue('green.primary', 'green.light')
  const blueTextColor = useColorModeValue('blue.primary', 'blue.light')

  return (
    <Flex wrap="wrap" noOfLines={2}>
      {rescue.stops.map(stop => (
        <Tag
          key={stop.id}
          size="sm"
          bg={stop.type === 'pickup' ? 'green.subtle' : 'blue.subtle'}
          color={stop.type === 'pickup' ? greenTextColor : blueTextColor}
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
      variant="outline"
      onChange={e => setStatus(e.target.value)}
      value={status}
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
    <Flex justify="space-between">
      <TabButton label={'Scheduled'} />
      <TabButton label={'Active'} />
      <TabButton label={'Completed'} />
      <TabButton label={'Cancelled'} />
    </Flex>
  )
}
