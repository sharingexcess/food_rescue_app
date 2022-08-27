import { Avatar, Box, Flex, Heading, Text } from '@chakra-ui/react'
import { useAuth, useIsMobile } from 'hooks'
import { Link } from 'react-router-dom'

export function MenuHeader() {
  const { user } = useAuth()
  const isMobile = useIsMobile()

  return (
    <>
      {isMobile && (
        <Heading mb="6" mt="4">
          Menu
        </Heading>
      )}
      {user && (
        <Link to="/profile">
          <Flex
            bg="surface.background"
            borderRadius="xl"
            p="2"
            border="1px solid"
            borderColor="element.subtle"
          >
            <Avatar name={user?.displayName} src={user?.photoURL} />
            <Box w="3" />
            <Box overflow="clip">
              <Heading as="h3" size="m" noOfLines={1} color="element.primary">
                {user?.displayName}
              </Heading>
              <Text
                as="p"
                fontSize="xs"
                fontWeight="300"
                noOfLines={1}
                color="element.secondary"
              >
                {user?.email}
              </Text>
            </Box>
          </Flex>
        </Link>
      )}
    </>
  )
}
