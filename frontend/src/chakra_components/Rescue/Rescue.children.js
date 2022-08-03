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
import { formatTimestamp, generateDirectionsLink } from 'helpers'
import { useRescueContext } from './Rescue'

export function RescueHeader() {
  const { rescue } = useRescueContext()
  return (
    <Flex pt="4" pb="8">
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

export function RescueStops() {
  const { rescue, activeStop, expandedStop, setexpandedStop } =
    useRescueContext()
  return rescue.stops.map((stop, i) =>
    stop.id === activeStop.id ? (
      <ActiveStop key={i} stop={stop} />
    ) : (
      <InactiveStop
        stop={stop}
        key={i}
        expandedStop={expandedStop}
        setexpandedStop={setexpandedStop}
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
  const { setopenStop, activeStop } = useRescueContext()
  const isActive = stop.id === activeStop.id
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
        onClick={() => setopenStop(stop.id)}
      >
        Open {stop.type}
      </Button>
    </>
  )
}

function InactiveStop({ stop, expandedStop, setexpandedStop }) {
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
          open={expandedStop === stop.id}
          onClick={() =>
            expandedStop === stop.id
              ? setexpandedStop(null)
              : setexpandedStop(stop.id)
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
        in={stop.id === expandedStop}
        startingHeight={0}
        endingHeight={120}
      >
        <StopButtonsBox stop={stop} visible={expandedStop === stop.id} />
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
