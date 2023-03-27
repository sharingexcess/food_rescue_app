import { ChevronRightIcon } from '@chakra-ui/icons'
import { Flex, Box, Heading, Text, IconButton } from '@chakra-ui/react'
import { STATUSES } from 'helpers'
import { Link } from 'react-router-dom'

export function WholesaleRescueCard({ rescue }) {
  const donation = rescue.transfers[0]
  return (
    <Link to={`/wholesale/${rescue.id}`}>
      <Flex gap="6" justify="space-between" align="center" py="6">
        <Box
          w="4"
          h="4"
          borderRadius="xl"
          flexGrow="0"
          flexShrink="0"
          bg={
            rescue.status === STATUSES.COMPLETED
              ? 'se.brand.primary'
              : 'surface.background'
          }
          border="3px solid"
          borderColor={
            rescue.status === STATUSES.COMPLETED
              ? 'se.brand.primary'
              : 'element.active'
          }
        />
        <Box flexGrow="1">
          <Heading
            size="md"
            fontWeight="600"
            color={
              rescue.status === STATUSES.COMPLETED
                ? 'element.primary'
                : 'element.active'
            }
          >
            {donation.organization.name}
          </Heading>
          <Text
            fontSize="sm"
            color="element.tertiary"
            fontWeight="300"
            noOfLines={1}
          >
            {donation.total_weight} lbs.&nbsp;&nbsp;|&nbsp;&nbsp;
            {donation.notes}
          </Text>
        </Box>
        <IconButton
          variant="ghosted"
          icon={<ChevronRightIcon w="6" h="6" color="element.tertiary" />}
        />
      </Flex>
    </Link>
  )
}
