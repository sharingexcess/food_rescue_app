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
import './Rescues.scss'

export function Rescues() {
  const { admin, user } = useAuth()
  const url_params = new URLSearchParams(window.location.search)
  // const handlers = useFirestore('users')
  // const navigate = useNavigate()
  // console.log('status:', url_params.get('status'))

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
  const [status, setStatus] = useState(url_params.get('status') || 'scheduled')

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

  const { data, loading, loadMore, refresh, error } = useApi(
    '/rescues',
    api_params
  )

  const { data: handlers } = useApi('/users')

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
  // FROM OLD RESCUES

  async function searchForHandler(value) {
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
        />
        <Input
          type="date"
          value={date}
          variant="flushed"
          onChange={e => handleChangeDate(e)}
          id="Datepicker"
          flexGrow="1"
          flexBasis="150px"
          fontSize="sm"
          color="element.secondary"
        />
      </Flex>
      {data &&
        data.map(rescue => <RescueCard rescue={rescue} key={rescue.id} />)}
    </Page>
  )
}

function RescueCard({ rescue }) {
  return (
    <Link to={`/chakra/rescues/${rescue.id}`} className="Rescue-Link">
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
      <Avatar
        src={rescue.handler?.icon}
        name={rescue.handler?.name}
        bg="gray.400"
        color="white"
      />
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
      variant="flushed"
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
