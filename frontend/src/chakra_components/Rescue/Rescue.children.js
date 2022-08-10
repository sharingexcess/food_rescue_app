import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Link,
  Text,
  Collapse,
} from '@chakra-ui/react'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
  ExternalLinkIcon,
  InfoIcon,
  PhoneIcon,
} from '@chakra-ui/icons'
import {
  formatTimestamp,
  generateDirectionsLink,
  formatPhoneNumber,
  STATUSES,
} from 'helpers'
import { useRescueContext } from './Rescue'
import { useState } from 'react'

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
  const { rescue, activeStop } = useRescueContext()
  return rescue.stops.map((stop, i) =>
    stop.id === activeStop?.id ? (
      <ActiveStop key={i} stop={stop} />
    ) : (
      <InactiveStop stop={stop} key={i} />
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
        <ChevronUpIcon
          h={8}
          w={8}
          transform={`rotate(${open ? '-180deg' : '0deg'})`}
          transition="transform 0.3s ease"
        />
      }
      onClick={onClick}
    />
  )
}

function StopButtonsBox({ stop }) {
  const { setOpenStop, activeStop } = useRescueContext()
  const isActive = stop.id === activeStop?.id

  return (
    <>
      <Flex justify="space-between" mb="4" gap="2">
        <Button
          variant={isActive ? 'secondary' : 'tertiary'}
          disabled={!stop.location.contact_phone}
          size="sm"
          flexGrow="1"
          leftIcon={<PhoneIcon />}
        >
          {stop.location.contact_phone ? (
            <a href={`tel:+${stop.location.contact_phone}`}>
              {formatPhoneNumber(stop.location.contact_phone)}
            </a>
          ) : (
            'No Phone'
          )}
        </Button>
        <Link
          href={generateDirectionsLink(
            stop.location.address1,
            stop.location.city,
            stop.location.state,
            stop.location.zip
          )}
          isExternal
          flexGrow={1}
          textDecoration="none !important"
        >
          <Button
            size="sm"
            width="100%"
            variant={isActive ? 'secondary' : 'tertiary'}
            leftIcon={<ExternalLinkIcon />}
          >
            Map
          </Button>
        </Link>
        <Button
          variant={isActive ? 'secondary' : 'tertiary'}
          size="sm"
          flexGrow="1"
          onClick={() => setOpenStop(stop)}
          leftIcon={<InfoIcon />}
        >
          Instructions
        </Button>
      </Flex>
      <Button
        width="100%"
        variant={isActive ? 'primary' : 'secondary'}
        size="lg"
        textTransform="capitalize"
        mb="2"
        onClick={() => setOpenStop(stop)}
        leftIcon={<EditIcon />}
      >
        Open {stop.type}
      </Button>
    </>
  )
}

function InactiveStop({ stop }) {
  // const { expandedStop, setExpandedStop } = useRescueContext()
  const [isExpanded, setIsExpanded] = useState()

  function toggleIsExpanded() {
    setIsExpanded(!isExpanded)
  }

  return (
    <Box px="4" my="3">
      <Flex justify={'space-between'} align="center">
        <Heading
          as="h6"
          fontWeight="600"
          letterSpacing={1}
          fontSize="sm"
          color="element.tertiary"
          textTransform="uppercase"
          py="2"
        >
          {statusIcon(stop.status)}&nbsp;&nbsp;{stop.type}
          {stop.status === STATUSES.COMPLETED
            ? ` (${stop.impact_data_total_weight} lbs.)`
            : ''}
        </Heading>
        <SelectedToggle open={isExpanded} onClick={toggleIsExpanded} />
      </Flex>

      <Heading as="h3" size="md" fontWeight="600" color="element.primary">
        {stop.organization.name}
      </Heading>
      <Text as="p" fontWeight="300" color="element.secondary">
        {stop.location.nickname || stop.location.address1}
      </Text>
      <Box h={4} />
      <Collapse in={isExpanded} startingHeight={0} endingHeight={120}>
        <StopButtonsBox stop={stop} />
      </Collapse>
      <Divider orientation="horizontal" />
    </Box>
  )
}

export function MapButton({ location, link }) {
  const { address1, address2, city, state, zip } = location

  return (
    <a
      href={generateDirectionsLink(address1, city, state, zip)}
      target="_blank"
    >
      {link}
    </a>
  )
}

export function LocationAddress({ location }) {
  return (
    <Text
      fontSize="sm"
      fontWeight={300}
      color="element.active"
      textDecoration="underline"
      mb="4"
    >
      {location.address1}, {location.city}, {location.state} {location.zip}
    </Text>
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
        fontWeight="600"
        letterSpacing={1}
        fontSize="sm"
        color="se.brand.primary"
        textTransform="uppercase"
        py="2"
      >
        {statusIcon(stop.status)}&nbsp;&nbsp;{stop.type}
      </Heading>
      <Heading as="h3" size="md" fontWeight="600" color="element.primary">
        {stop.organization.name}
      </Heading>
      <Text as="p" fontWeight="300" color="element.secondary">
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
