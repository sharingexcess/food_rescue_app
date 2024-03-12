import { ChevronRightIcon } from '@chakra-ui/icons'
import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/react'
import { formatLargeNumber } from 'helpers'
import { useAuth } from 'hooks'
import moment from 'moment'

export function Recipient({ recipient, setEditRecipient }) {
  const { hasAdminPermission } = useAuth()
  return (
    <Flex
      w="100%"
      justify="space-between"
      align="center"
      bg="surface.card"
      borderRadius="md"
      boxShadow="md"
      p="4"
      my="4"
      onClick={() => setEditRecipient(recipient)}
      cursor="pointer"
    >
      <Box>
        <Text fontSize="xs" color="element.tertiary" mb="1">
          <Text
            as="span"
            color="se.brand.primary"
            fontWeight="700"
            textTransform="uppercase"
          >
            {formatLargeNumber(recipient.total_weight)} lbs.
          </Text>
          &nbsp;&nbsp;
          {moment(recipient.timestamp_completed).format('dddd M/DD/YY - h:mma')}
        </Text>
        <Heading as="h4" size="md" fontWeight="600" color="element.primary">
          {recipient.organization.name}
        </Heading>
        <Text size="sm" fontWeight="300" color="element.secondary">
          {recipient.location.nickname || recipient.location.address1}
        </Text>
        <Text fontSize="sm" fontWeight="300" color="element.secondary">
          <Text as="span" fontWeight="500">
            Notes:{' '}
          </Text>
          "{recipient.notes}"
        </Text>
      </Box>

      {hasAdminPermission && (
        <IconButton variant="ghosted" icon={<ChevronRightIcon w="8" h="8" />} />
      )}
    </Flex>
  )
}
