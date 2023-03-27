import { Avatar, Box, Flex, Heading, Tag, Text } from '@chakra-ui/react'
import { formatTimestamp } from 'helpers'
import { useIsMobile } from 'hooks'
import { Link } from 'react-router-dom'

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
      <Avatar src={rescue.handler?.icon} name={rescue.handler?.name} />
      <Box w={4} />
      <Flex direction="column">
        <Heading as="h2" size="md" color="element.primary">
          {rescue.handler?.name || 'Available Rescue'}
        </Heading>
        <Text color="element.secondary" fontSize="xs">
          {formatTimestamp(rescue.timestamp_scheduled, 'dddd, MMMM DD - h:mma')}
        </Text>
      </Flex>
    </Flex>
  )
}

function CardTags({ rescue }) {
  const isMobile = useIsMobile()

  return (
    <Flex wrap="wrap" noOfLines={2}>
      {rescue.transfers.map(transfer => (
        <Tag
          key={transfer.id}
          size="sm"
          bg={
            transfer.type === 'collection'
              ? 'blue.secondary'
              : 'green.secondary'
          }
          color={
            transfer.type === 'collection' ? 'blue.primary' : 'green.primary'
          }
          borderRadius="xl"
          flexShrink={0}
          mr="1"
        >
          {transfer.organization.name.length > 13 && isMobile
            ? transfer.organization.name.substr(0, 13) + '...'
            : transfer.organization.name}
        </Tag>
      ))}
    </Flex>
  )
}
