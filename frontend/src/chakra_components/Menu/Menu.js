import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useColorMode,
  Avatar,
  Flex,
  Heading,
  Box,
  Text,
  Button,
  Switch,
  Spacer,
  Divider,
} from '@chakra-ui/react'
import { useAuth, useIsMobile } from 'hooks'
import { Link } from 'react-router-dom'
import { auth } from 'helpers'

export function Menu({ isOpen, onClose }) {
  const { colorMode, toggleColorMode } = useColorMode()
  const isMobile = useIsMobile()

  return isMobile ? (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="surface.card">
          <DrawerCloseButton />
          <DrawerHeader>
            <MenuHeader />
          </DrawerHeader>

          <DrawerBody py="8">
            <MenuBody colorMode={colorMode} toggleColorMode={toggleColorMode} />
          </DrawerBody>

          <DrawerFooter>
            <MenuFooter />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  ) : (
    <Flex
      direction="column"
      w="280px"
      h="100%"
      p="16px"
      mr="64px"
      boxShadow="default"
      bg="surface.card"
      borderRadius="xl"
    >
      <MenuHeader />
      <Flex h={8} />
      <MenuBody colorMode={colorMode} toggleColorMode={toggleColorMode} />
      <Spacer />
      <MenuFooter />
    </Flex>
  )
}

function MenuHeader() {
  const { user } = useAuth()

  return (
    <Flex>
      <Avatar
        name={user.displayName}
        src={user.photoURL}
        bg="blue.500"
        color="white"
      />
      <Box w="3" />
      <Box overflow="clip">
        <Heading as="h3" size="m" noOfLines={1} color="element.primary">
          {user.displayName}
        </Heading>
        <Text
          as="p"
          fontSize="sm"
          fontWeight="300"
          noOfLines={1}
          color="element.secondary"
        >
          {user.email}
        </Text>
      </Box>
    </Flex>
  )
}

function MenuBody({ colorMode, toggleColorMode }) {
  return (
    <Flex direction="column">
      <Flex w="100%" justify="space-between" my="2">
        <Button variant="link" fontSize="xl" mr="auto" fontWeight="normal">
          Dark Mode
        </Button>
        <Switch
          size="lg"
          isChecked={colorMode === 'dark'}
          onChange={() => toggleColorMode()}
        />
      </Flex>
      <Link to="/chakra/rescues">
        <Button
          variant="link"
          fontSize="xl"
          mr="auto"
          my="2"
          fontWeight="normal"
        >
          Rescues
        </Button>
      </Link>
    </Flex>
  )
}

function MenuFooter() {
  function handleLogout() {
    // firebase.auth().signOut()
    auth.signOut()
  }
  return (
    <Flex justify="space-around" w="100%">
      <Button variant="link" size="xs" onClick={handleLogout}>
        Logout
      </Button>
      <Button variant="link" size="xs">
        Legal
      </Button>
      <Button variant="link" size="xs">
        Privacy Policy
      </Button>
    </Flex>
  )
}
