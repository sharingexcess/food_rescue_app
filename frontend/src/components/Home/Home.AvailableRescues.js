import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Skeleton,
  Tag,
  Text,
} from '@chakra-ui/react'
import { FooterButton } from 'components'
import { formatTimestamp } from 'helpers'
import { useApi, useIsMobile } from 'hooks'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

export function AvailableRescues() {
  const isMobile = useIsMobile()
  const { data: availableRescues } = useApi(
    '/rescues',
    useMemo(() => ({ status: 'scheduled', handler_id: 'null' }), [])
  )

  function ShowAvailableRescues() {
    return (
      <Box pb="24">
        {availableRescues.map(rescue => (
          <RescueCard key={rescue.id} rescue={rescue} />
        ))}
      </Box>
    )
  }

  function NoAvailableRescues() {
    return (
      <Flex direction="column" align="center" w="100%" py="8">
        <Heading size="xl" color="element.secondary" mb="4">
          😐
        </Heading>
        <Heading
          as="h4"
          size="sm"
          color="element.secondary"
          align="center"
          mb="2"
        >
          There are currently no available rescues.
        </Heading>
        <Box px={'4'}>
          <Text align="center" fontSize="sm" color="element.secondary">
            Check back another time if you'd like to claim a rescue!
          </Text>
        </Box>
      </Flex>
    )
  }

  function LoadingAvailableRescues() {
    return (
      <Box mt="6">
        <Skeleton h="32" w="100%" my="4" />
        <Skeleton h="32" w="100%" my="4" />
        <Skeleton h="32" w="100%" my="4" />
      </Box>
    )
  }

  return (
    <Box px={isMobile ? '4' : '8'} pt="8">
      <Flex w="100%" justify="space-between" align="center">
        <Heading as="h4" color="element.primary" fontSize="lg" my="0">
          Available Rescues
        </Heading>
        {!isMobile && (
          <Link to="/rescues">
            <Button variant="tertiary" size="sm">
              View All Rescues
            </Button>
          </Link>
        )}
      </Flex>
      {availableRescues ? (
        availableRescues.length ? (
          <ShowAvailableRescues />
        ) : (
          <NoAvailableRescues />
        )
      ) : (
        <LoadingAvailableRescues />
      )}
      {isMobile && (
        <Link to="/rescues">
          <FooterButton>View All Rescues</FooterButton>
        </Link>
      )}
    </Box>
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
      <Avatar
        bg="green.secondary"
        color="green.primary"
        name={`${formatTimestamp(
          rescue.timestamp_scheduled_start,
          'dddd'
        )} ${formatTimestamp(
          rescue.timestamp_scheduled_start,
          'dddd'
        ).substring(1)}`}
      />
      <Box w={4} />
      <Flex direction="column">
        <Heading as="h2" size="md" color="element.primary">
          {formatTimestamp(rescue.timestamp_scheduled_start, 'MMMM DD')}
        </Heading>
        <Text color="element.secondary" fontSize="xs">
          {rescue.stops.length} stops&nbsp;&nbsp;|&nbsp;&nbsp;
          {rescue.driving_distance.toFixed(1)} miles
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
