import { DragHandleIcon } from '@chakra-ui/icons'
import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/react'
import { STATUSES } from 'helpers'

export function Stop({ stop }) {
  return (
    <Flex
      my="3"
      bg="surface.card"
      boxShadow="md"
      borderRadius="md"
      justify="flex-start"
      align="center"
      cursor="grab"
      _active={{ cursor: 'grabbing' }}
    >
      {[STATUSES.SCHEDULED, STATUSES.ACTIVE].includes(stop.status) ? (
        <IconButton
          variant="ghosted"
          icon={<DragHandleIcon color="element.tertiary" w="3" />}
        />
      ) : (
        <Box w="4" />
      )}
      <Box w="100%" pb="4" pt="3">
        <Flex justify={'space-between'} align="center" py="1">
          <Heading
            as="h6"
            fontWeight="600"
            letterSpacing={1}
            fontSize="sm"
            color="element.tertiary"
            textTransform="uppercase"
          >
            {stop.type}
          </Heading>
        </Flex>
        <Heading as="h3" size="md" fontWeight="600" color="element.primary">
          {stop.organization.name}
        </Heading>
        <Text fontWeight="300" color="element.secondary">
          {stop.location.nickname || stop.location.address1}
        </Text>
      </Box>
    </Flex>
  )
}
