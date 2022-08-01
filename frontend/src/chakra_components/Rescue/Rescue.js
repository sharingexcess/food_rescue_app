import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Text,
  useColorModeValue,
  Collapse,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import axios from 'axios'
import { useApi, useAuth } from 'hooks'
import { formatTimestamp, SE_API } from 'helpers'
import { useNavigate, useParams } from 'react-router-dom'
import { createContext, useContext, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { Page } from 'chakra_components/Page/Page'

// { id, initialData }

const RescueContext = createContext({})
const useRescueContext = () => useContext(RescueContext)

export function Rescue() {
  const { admin, user } = useAuth()
  // const { data, refetch } = useQuery(
  //   ['rescue', id],
  //   async () => {
  //     const token = await user.getIdToken()
  //     if (!token) return
  //     const res = await axios.get(`/api/rescues/${id}?token=${token}`)
  //     return res.data
  //   },
  //   { initialData }
  // )

  // useEffect(() => {
  //   refetch()
  // }, [user])

  // FROM OLD RESCUE
  const navigate = useNavigate()
  const { rescue_id } = useParams()

  const [working, setWorking] = useState(false)
  const { data, refresh, loading, error } = useApi(`/rescues/${rescue_id}`)
  // FROM OLD RESCUE

  const [open, setOpen] = useState(null)
  const [active, setActive] = useState(null)

  return (
    <Page
      id="Rescue"
      title={data ? `${data.status} Rescue` : 'Loading Rescue...'}
      breadcrumbs={[
        { label: 'Rescues', link: '/chakra/rescues' },
        { label: rescue_id, link: `/chakra/rescues/${rescue_id}` },
      ]}
    >
      <RescueContext.Provider value={{ open, setOpen }}>
        <Flex direction="column" w="100%">
          {data && <RescueHeader rescue={data} />}
          <Box h="4" />
          {data && (
            <RescueStops
              stops={data.stops}
              active={active}
              setActive={setActive}
              open={open}
              setOpen={setOpen}
            />
          )}
        </Flex>
      </RescueContext.Provider>
    </Page>
  )
}

function RescueHeader({ rescue }) {
  const subtextColor = useColorModeValue('gray.400', 'gray.500')
  // const { setOpen } = useRescueContext()

  return (
    <Flex py="4">
      <Avatar
        src={rescue.handler.icon}
        name={rescue.handler.name}
        bg="gray.500"
      />
      <Box w="4" />
      <Flex direction="column">
        <Heading as="h4" size="md" mb="4px">
          {rescue.handler?.name || 'Available Rescue'}
        </Heading>
        <Text color={subtextColor} fontSize="xs">
          {formatTimestamp(
            rescue.timestamp_scheduled_start,
            'dddd, MMMM DD | h:mma'
          )}
          {formatTimestamp(rescue.timestamp_scheduled_finish, ' - h:mma')}
        </Text>
      </Flex>
    </Flex>
  )
}

function RescueStops({ stops, active, setActive, open, setOpen }) {
  return stops.map((stop, i) =>
    stop.id === active ? (
      <ActiveStop key={i} />
    ) : (
      <UnselectedStop stop={stop} key={i} open={open} setOpen={setOpen} />
    )
  )
}

function SelectedToggle({ open, onClick }) {
  return (
    <IconButton
      aria-label="Rescue stop"
      icon={
        open ? <ChevronUpIcon h={6} w={6} /> : <ChevronDownIcon h={6} w={6} />
      }
      onClick={onClick}
    />
  )
}

function StopContent({
  stop,
  // visible
}) {
  // const [visible, setVisible] = useState(false)
  const { open, setOpen } = useRescueContext()
  return (
    <>
      <Button onClick={() => setOpen(stop.id === open ? null : stop.id)}>
        expand
      </Button>
      <Collapse in={stop.id === open} startingHeight={0} endingHeight={28}>
        {/* <Flex
        direction="column"
        justify="start"
        // h={visible ? '28' : '0'}
        // overflow="hidden"
      > */}
        <Flex justify="space-between" mb="2">
          <Button variant="outline">Number</Button>
          <Button variant="outline">Map</Button>
          <Button variant="outline">Instructions</Button>
        </Flex>
        <Button variant="solid" bg="brand.primary">
          Open Pickup
        </Button>
        {/* </Flex> */}
      </Collapse>
    </>
  )
}

function UnselectedStop({ stop, open, setOpen }) {
  return (
    <Box px="4" my="3">
      <Flex justify={'space-between'} align="center">
        <Heading
          as="h6"
          fontWeight="700"
          letterSpacing={1}
          fontSize="md"
          color="gray"
          textTransform="uppercase"
          py="2"
        >
          {statusIcon(stop.status)}&nbsp;&nbsp;{stop.type}
        </Heading>
        <SelectedToggle
          open={open === stop.id}
          onClick={() => (open === stop.id ? setOpen(null) : setOpen(stop.id))}
        />
      </Flex>

      <Heading as="h3" size="md" fontWeight="600">
        {stop.organization.name}
      </Heading>
      <Text as="p" fontWeight="200">
        {stop.location.nickname || stop.location.address1}
      </Text>
      <Box h={4} />
      <StopContent stop={stop} visible={open === stop.id} />
      <Divider orientation="horizontal" />
    </Box>
  )
}

function SelectedStop({ stop }) {
  const cardColor = useColorModeValue('card-light', 'card-dark')
  return (
    <Box
      px="4"
      my="2"
      py="2"
      background={cardColor}
      boxShadow="md"
      borderRadius="xl"
    >
      <Heading
        as="h6"
        fontWeight="700"
        letterSpacing={1}
        fontSize="md"
        color="brand.primary"
        textTransform="uppercase"
        py="4"
      >
        {statusIcon(stop.status)}&nbsp;&nbsp;{stop.type}
      </Heading>
      <Heading as="h3" size="md" fontWeight="600">
        {stop.organization.name}
      </Heading>
      <Text as="p" fontWeight="200">
        {stop.location.nickname || stop.location.address1}
      </Text>
      <Box h="4" />
      <Flex justify="space-between" mb="4" gap="2">
        <Button
          variant="outline"
          w="100%"
          disabled={!stop.location.phone}
          size="sm"
        >
          {stop.location.phone || 'No Phone #'}
        </Button>
        <Button variant="outline" w="100%" size="sm">
          Map
        </Button>
        <Button variant="outline" w="100%" size="sm">
          Instructions
        </Button>
      </Flex>
      <Button
        width="100%"
        bg="brand.primary"
        size="lg"
        textTransform="capitalize"
        mb="2"
      >
        Log {stop.type} Details
      </Button>
    </Box>
  )
}

function statusIcon(status) {
  return status === 'cancelled'
    ? '❌'
    : status === 'scheduled'
    ? '🗓'
    : status === 'active'
    ? '🏃'
    : '✅'
}
