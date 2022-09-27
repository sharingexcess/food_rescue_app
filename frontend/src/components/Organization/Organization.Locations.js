import { ChevronRightIcon } from '@chakra-ui/icons'
import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/react'
import { formatPhoneNumber } from 'helpers'
import { Link } from 'react-router-dom'

export function Locations({ organization }) {
  return (
    <>
      {organization.locations.map((location, i) => (
        <Link
          key={i}
          to={`/organizations/${organization.id}/locations/${location?.id}`}
        >
          <Flex
            bg="surface.card"
            boxShadow="md"
            borderRadius="md"
            p="4"
            my="4"
            w="100%"
            justify="space-between"
            align="center"
          >
            <Box>
              <Heading as="h4" size="md" mb="1">
                {location.nickname || location.address1}
              </Heading>
              <Text fontSize="sm" color="element.secondary" fontWeight="300">
                {location.address1}
              </Text>
              <Text fontSize="sm" color="element.secondary" fontWeight="300">
                {location.city}, {location.state} {location.zip}
              </Text>

              {location.contact_phone && (
                <Text
                  fontSize="sm"
                  color="element.active"
                  fontWeight="300"
                  mt="1"
                >
                  {formatPhoneNumber(location.contact_phone)}
                </Text>
              )}
            </Box>
            <IconButton
              variant="ghosted"
              icon={<ChevronRightIcon color="element.tertiary" h="8" w="8" />}
            />
          </Flex>
        </Link>
      ))}
    </>
  )
}
