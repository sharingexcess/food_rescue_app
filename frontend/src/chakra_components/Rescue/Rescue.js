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
import { useApi, useAuth } from 'hooks'
import { formatTimestamp, generateDirectionsLink } from 'helpers'
import { useNavigate, useParams } from 'react-router-dom'
import { createContext, useContext, useMemo, useState } from 'react'
import { Page } from 'chakra_components/Page/Page'
import { CardOverlay } from 'chakra_components/CardOverlay/CardOverlay'

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

  const [openStopId, setOpenStopId] = useState(null)
  const [openStopCardId, setOpenStopCardId] = useState(null)

  const getActiveStopId = data => {
    let activeStopId
    for (const stop of data.stops) {
      if (stop.status !== 'cancelled' && stop.status !== 'completed') {
        activeStopId = stop.id
        break
      }
    }
    return activeStopId
  }

  const activeStopId = useMemo(
    () => (data ? getActiveStopId(data) : null),
    [data]
  )

  return (
    <Page
      id="Rescue"
      title={data ? `${data.status} Rescue` : 'Loading Rescue...'}
      breadcrumbs={[
        { label: 'Rescues', link: '/chakra/rescues' },
        { label: rescue_id, link: `/chakra/rescues/${rescue_id}` },
      ]}
    >
      <RescueContext.Provider
        value={{ openStopId, setOpenStopId, setOpenStopCardId }}
      >
        <Flex direction="column" w="100%">
          {data && <RescueHeader rescue={data} />}
          <Box h="4" />
          {data && (
            <RescueStops
              stops={data.stops}
              activeStopId={activeStopId}
              openStopId={openStopId}
              setOpenStopId={setOpenStopId}
            />
          )}
        </Flex>
        <CardOverlay
          isOpen={openStopCardId}
          onClose={() => setOpenStopCardId(null)}
        />
      </RescueContext.Provider>
    </Page>
  )
}

function RescueHeader({ rescue }) {
  const subtextColor = useColorModeValue('gray.400', 'gray.500')
  // const { setOpenStopId } = useRescueContext()

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

function RescueStops({ stops, activeStopId, openStopId, setOpenStopId }) {
  return stops.map((stop, i) =>
    stop.id === activeStopId ? (
      <ActiveStop key={i} stop={stop} />
    ) : (
      <UnselectedStop
        stop={stop}
        key={i}
        openStopId={openStopId}
        setOpenStopId={setOpenStopId}
      />
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

function StopButtonsBox({
  stop,
  // visible
}) {
  // const [visible, setVisible] = useState(false)
  const { openStopId, setOpenStopId } = useRescueContext()
  return (
    <>
      <Button
        onClick={() => setOpenStopId(stop.id === openStopId ? null : stop.id)}
      >
        expand
      </Button>
      <Collapse
        in={stop.id === openStopId}
        startingHeight={0}
        endingHeight={28}
      >
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

function UnselectedStop({ stop, openStopId, setOpenStopId }) {
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
          open={openStopId === stop.id}
          onClick={() =>
            openStopId === stop.id
              ? setOpenStopId(null)
              : setOpenStopId(stop.id)
          }
        />
      </Flex>

      <Heading as="h3" size="md" fontWeight="600">
        {stop.organization.name}
      </Heading>
      <Text as="p" fontWeight="200">
        {stop.location.nickname || stop.location.address1}
      </Text>
      <Box h={4} />
      <StopButtonsBox stop={stop} visible={openStopId === stop.id} />
      <Divider orientation="horizontal" />
    </Box>
  )
}

function MapButton({ location }) {
  const { address1, address2, city, state, zip } = location
  const button = (
    <Button variant="outline">
      <Emoji name="round-pushpin" width={20} />
      <Spacer width={8} />
      {address1}
      {address2 && ` - ${address2}`}
      <br />
      {city}, {state} {zip}
    </Button>
  )

  return s.status && s.status !== STATUSES.COMPLETED ? (
    <ExternalLink
      to={generateDirectionsLink(
        s.location.address1,
        s.location.city,
        s.location.state,
        s.location.zip
      )}
    >
      {button}
    </ExternalLink>
  ) : (
    button
  )
}

function ActiveStop({ stop }) {
  const cardColor = useColorModeValue('card-light', 'card-dark')
  const { setOpenStopCardId } = useRescueContext()
  return (
    <Box
      px="4"
      my="2"
      py="2"
      background={cardColor}
      boxShadow="dark-lg"
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
          disabled={!stop.location.contact_phone}
          size="sm"
        >
          {stop.location.contact_phone || 'No Phone #'}
          {/* <Text>{stop.location}</Text> */}
          {console.log('location', stop.location)}
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
        onClick={() => setOpenStopCardId(stop.id)}
      >
        Open {stop.type}
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
