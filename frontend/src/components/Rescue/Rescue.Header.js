import { Avatar, Box, Flex, Heading, Text } from '@chakra-ui/react'
import { formatTimestamp } from 'helpers'
import { Link } from 'react-router-dom'
import { useRescueContext } from './Rescue'

export function RescueHeader() {
  const { rescue } = useRescueContext()

  const withProfileLink = content => (
    <Link to={`/people/${rescue?.handler_id}`}>{content}</Link>
  )

  const content = (
    <>
      <Flex pt="2" pb="8" align="center">
        <Avatar src={rescue?.handler?.icon} name={rescue?.handler?.name} />
        <Box w="4" />
        <Flex direction="column">
          <Text
            color="element.tertiary"
            fontSize="xs"
            textTransform="uppercase"
            fontWeight="700"
            mt="1"
          >
            {rescue.type.replace('-', ' ')}
          </Text>
          <Heading as="h4" size="md" mb="4px" color="element.primary">
            {rescue?.handler?.name || 'Available'}
          </Heading>
          <Text color="element.secondary" fontSize="xs">
            <Text as="span" fontWeight={700}>
              Scheduled:
            </Text>{' '}
            {formatTimestamp(rescue.timestamp_scheduled, 'dddd M/DD - h:mma')}
          </Text>
          {rescue.timestamp_completed && (
            <Text color="element.secondary" fontSize="xs">
              <Text as="span" fontWeight={700}>
                Completed:
              </Text>{' '}
              {formatTimestamp(rescue.timestamp_completed, 'dddd M/DD - h:mma')}
            </Text>
          )}
          {rescue.notes && (
            <Text color="element.secondary" fontSize="xs">
              <Text as="span" fontWeight={700}>
                Notes:
              </Text>{' '}
              "{rescue.notes}"
            </Text>
          )}
        </Flex>
      </Flex>
    </>
  )

  return rescue?.handler_id ? withProfileLink(content) : content
}
