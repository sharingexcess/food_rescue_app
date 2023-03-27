import { ChevronRightIcon } from '@chakra-ui/icons'
import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/react'
import { formatLargeNumber } from 'helpers'
import { useAuth } from 'hooks'

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
        <Heading
          as="h6"
          fontWeight="600"
          letterSpacing={1}
          fontSize="sm"
          color="element.tertiary"
          textTransform="uppercase"
          mb="ed"
        >
          RECIPIENT&nbsp;&nbsp;|&nbsp;&nbsp;
          <Text as="span" color="se.brand.primary">
            {formatLargeNumber(recipient.total_weight)} lbs.
          </Text>
        </Heading>
        <Heading as="h4" size="md" fontWeight="600" color="element.primary">
          {recipient.organization.name}
        </Heading>
        <Text size="sm" fontWeight="300" color="element.secondary">
          {recipient.location.nickname || recipient.location.address1}
        </Text>
      </Box>

      {hasAdminPermission && (
        <IconButton variant="ghosted" icon={<ChevronRightIcon w="8" h="8" />} />
      )}
    </Flex>
  )
}
