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
import { Page, Autocomplete } from 'chakra_components'
import moment from 'moment'

export function Rescues() {
  const { admin, user } = useAuth()
  const handlers = useFirestore('users')
  const url_params = new URLSearchParams(window.location.search)
  // const navigate = useNavigate()
  // console.log('status:', url_params.get('status'))
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

  const [handler, setHandler] = useState()
  const [date, setDate] = useState()

  function handleChangeDate(event) {
    const dateValue = event.target.value
      ? moment(event.target.value).format('YYYY-MM-DD')
      : ''
    setDate(dateValue)
  }

  useEffect(() => {
    console.log('date', date)
  }, [date])

  const api_params = useMemo(
    () => ({
      status: state.status === 'available', // ? 'scheduled' : state.status,
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
    params.set('status', 'scheduled')
    // params.set('handler_id', handler)
    params.set('date', date)
    params.set('handler_name', handler)
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${params.toString()}`
    )
    console.log('params', url_params)
  }, [handler, date])
  // FROM OLD RESCUES

  async function searchForHandler(value) {
    // const handlers = await SE_API.get('/users')
    // const handlers = [
    //   { name: 'Ryan McHenry', id: 1 },
    //   { name: 'Oroghene Emudainohwo', id: 2 },
    // ]
    const { handlers, loading, loadMore, refresh, error } = useApi('/users')
    return handlers.filter(i =>
      i.name.toLowerCase().includes(value.toLowerCase())
    )
  }

  return (
    <Page
      id="Rescues"
      title="Rescues"
      breadcrumbs={[{ label: 'Rescues', link: '/chakra/rescues' }]}
    >
      <TabButtons />
      <Flex justify="space-between" my="2">
        <Autocomplete
          placeholder="Handler..."
          value={handler}
          setValue={setHandler}
          displayField="name"
          handleChange={value => searchForHandler(value)}
          w={40}
        />
        <Input
          type="date"
          value={date}
          variant="flushed"
          onChange={e => handleChangeDate(e)}
          w={40}
        />
      </Flex>
      {data &&
        data.map(rescue => <RescueCard rescue={rescue} key={rescue.id} />)}
    </Page>
  )
}

function RescueCard({ rescue }) {
  const cardColor = useColorModeValue('card-light', 'card-dark')

  return (
    <Link to={`/chakra/rescues/${rescue.id}`} className="Rescue-Link">
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
    <Flex justify="start">
      <TabButton label={'Scheduled'} />
      <TabButton label={'Active'} />
      <TabButton label={'Completed'} />
      <TabButton label={'Cancelled'} />
    </Flex>
  )
}
