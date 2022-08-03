import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Text,
  Collapse,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { useApi, useAuth } from 'hooks'
import { formatTimestamp, generateDirectionsLink } from 'helpers'
import { useNavigate, useParams } from 'react-router-dom'
import { createContext, useContext, useMemo, useState } from 'react'
import { Page } from 'chakra_components/Page/Page'
import { CardOverlay } from 'chakra_components/CardOverlay/CardOverlay'
import { getActiveStopId } from './Rescue.utils'
import { Error, Loading } from 'components'

const RescueContext = createContext({})
const useRescueContext = () => useContext(RescueContext)

export function Rescue() {
  const { rescue_id } = useParams()
  const { data: rescue, loading, error } = useApi(`/rescues/${rescue_id}`)

  const [openStopId, setOpenStopId] = useState(null)
  const [openStopCardId, setOpenStopCardId] = useState(null)

  const activeStopId = useMemo(
    () => (rescue ? getActiveStopId(rescue) : null),
    [rescue]
  )

  if (loading) return <Loading text="Loading Rescue" />
  if (error) return <Error message={error} />
  if (!rescue) return <Error message="No Rescue Found" />

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
        value={{ openStopId, setOpenStopId, setOpenStopCardId, activeStopId }}
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
  return (
    <Flex py="4">
      <Avatar
        src={rescue?.handler?.icon}
        name={rescue?.handler?.name}
        bg="element.secondary"
      />
      <Box w="4" />
      <Flex direction="column">
        <Heading as="h4" size="md" mb="4px" color="element.primary">
          {rescue?.handler?.name || 'Available Rescue'}
        </Heading>
        <Text color="element.secondary" fontSize="xs">
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
      variant="tertiary"
      color="element.tertiary"
      icon={
        open ? <ChevronUpIcon h={8} w={8} /> : <ChevronDownIcon h={8} w={8} />
      }
      onClick={onClick}
    />
  )
}

function StopButtonsBox({ stop }) {
  const { setOpenStopCardId, activeStopId } = useRescueContext()
  const isActive = stop.id === activeStopId
  return (
    <>
      <Flex justify="space-between" mb="4" gap="2">
        <Button
          variant={isActive ? 'secondary' : 'tertiary'}
          disabled={!stop.location.contact_phone}
          size="sm"
          flexGrow="1"
        >
          {stop.location.contact_phone || 'No Phone #'}
        </Button>
        <Button
          variant={isActive ? 'secondary' : 'tertiary'}
          size="sm"
          flexGrow="1"
        >
          Map
        </Button>
        <Button
          variant={isActive ? 'secondary' : 'tertiary'}
          size="sm"
          flexGrow="1"
        >
          Show Instructions
        </Button>
      </Flex>
      <Button
        width="100%"
        variant={isActive ? 'primary' : 'secondary'}
        size="lg"
        textTransform="capitalize"
        mb="2"
        onClick={() => setOpenStopCardId(stop.id)}
      >
        Open {stop.type}
      </Button>
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
          color="element.tertiary"
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
      <Collapse
        in={stop.id === openStopId}
        startingHeight={0}
        endingHeight={120}
      >
        <StopButtonsBox stop={stop} visible={openStopId === stop.id} />
      </Collapse>
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
  return (
    <Box
      px="4"
      my="2"
      py="2"
      background="surface.card"
      boxShadow="default"
      borderRadius="lg"
    >
      <Heading
        as="h6"
        fontWeight="700"
        letterSpacing={1}
        fontSize="md"
        color="se.brand.primary"
        textTransform="uppercase"
        py="2"
      >
        {statusIcon(stop.status)}&nbsp;&nbsp;{stop.type}
      </Heading>
      <Heading as="h3" size="md" fontWeight="600" color="element.primary">
        {stop.organization.name}
      </Heading>
      <Text as="p" fontWeight="200" color="element.secondary">
        {stop.location.nickname || stop.location.address1}
      </Text>
      <Box h="4" />
      <StopButtonsBox stop={stop} />
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
