import {
  Avatar,
  Box,
  Flex,
  Heading,
  Select,
  Tag,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import axios from 'axios'
import { useAuth, useIsMobile } from 'hooks'
import { formatTimestamp, SE_API } from 'helpers'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Page } from 'chakra_components'

export function Rescues() {
  const { user } = useAuth()
  // const navigate = useNavigate()
  const url_params = new URLSearchParams(window.location.search)
  const [status, setStatus] = useState(url_params.get('status') || 'scheduled')
  const query = useQuery(['rescues'], async () => {
    const token = await user.accessToken
    if (!token) {
      console.log('no access token')
      return
    }
    console.log('running fetch', `${API_URL}/rescues?limit=5&status=scheduled`)
    const res = await fetch(`${API_URL}/rescues?limit=5&status=scheduled`)
    console.log(res)
    return res
  })

  console.log(query)

  const { data, refetch } = query

  // useEffect(() => {
  //   // const params = new URLSearchParams({ status, limit })
  //   // navigate('/chakra/rescues?' + params.toString(), undefined, {
  //   //   shallow: true,
  //   // })
  //   console.log('refetching')
  //   refetch()
  // }, [status, user])

  return (
    <Page
      id="Rescues"
      title="Rescues"
      breadcrumbs={[{ label: 'Rescues', link: '/rescues' }]}
    >
      <StatusSelect status={status} setStatus={setStatus} />
      {data &&
        data.map(rescue => <RescueCard rescue={rescue} key={rescue.id} />)}
    </Page>
  )
}

function RescueCard({ rescue }) {
  const cardColor = useColorModeValue('card-light', 'card-dark')

  return (
    <Link to={`/rescues/${rescue.id}`}>
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