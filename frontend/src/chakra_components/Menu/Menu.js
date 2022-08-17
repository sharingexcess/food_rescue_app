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
  ) : (
    <Flex
      as="aside"
      direction="column"
      position="fixed"
      top="112px"
      left="max(32px, calc(50vw - 600px))"
      w="280px"
      h="calc(100vh - 144px)"
      p="16px"
      boxShadow="default"
      bg="surface.card"
      borderRadius="xl"
      zIndex={10}
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
    <Link to="/profile">
      <Flex>
        <Avatar name={user?.displayName} src={user?.photoURL} />
        <Box w="3" />
        <Box overflow="clip">
          <Heading as="h3" size="m" noOfLines={1} color="element.primary">
            {user?.displayName}
          </Heading>
          <Text
            as="p"
            fontSize="sm"
            fontWeight="300"
            noOfLines={1}
            color="element.secondary"
          >
            {user?.email}
          </Text>
        </Box>
      </Flex>
    </Link>
  )
}

function MenuBody({ colorMode, toggleColorMode }) {
  const { hasPermission } = useAuth()

  return (
    <Flex direction="column">
      <Flex w="100%" justify="space-between" my="2">
        <Button
          variant="ghosted"
          fontSize="xl"
          mr="auto"
          color="element.primary"
          fontWeight="300"
        >
          Dark Mode
        </Button>
        <Switch
          size="lg"
          isChecked={colorMode === 'dark'}
          onChange={() => toggleColorMode()}
        />
      </Flex>
      <Link to="/rescues">
        <Button
          variant="ghosted"
          color={
            location.pathname === '/rescues'
              ? 'blue.primary'
              : 'element.primary'
          }
          fontWeight={location.pathname === '/rescues' ? '600' : '300'}
          fontSize="xl"
          mr="auto"
          my="2"
          disabled={!hasPermission}
        >
          Rescues
        </Button>
      </Link>
      <Link to="/wholesale">
        <Button
          variant="ghosted"
          color={
            location.pathname === '/wholesale'
              ? 'blue.primary'
              : 'element.primary'
          }
          fontWeight={location.pathname === '/wholesale' ? '600' : '300'}
          fontSize="xl"
          mr="auto"
          my="2"
          disabled={!hasPermission}
        >
          Wholesale
        </Button>
      </Link>
      <Link to="/people">
        <Button
          variant="ghosted"
          color={
            location.pathname === '/people' ? 'blue.primary' : 'element.primary'
          }
          fontWeight={location.pathname === '/people' ? '600' : '300'}
          fontSize="xl"
          mr="auto"
          my="2"
          disabled={!hasPermission}
        >
          People
        </Button>
      </Link>
      <Link to="/organizations">
        <Button
          variant="ghosted"
          color={
            location.pathname === '/organizations'
              ? 'blue.primary'
              : 'element.primary'
          }
          fontWeight={location.pathname === '/organizations' ? '600' : '300'}
          fontSize="xl"
          mr="auto"
          my="2"
          disabled={!hasPermission}
        >
          Organizations
        </Button>
      </Link>
    </Flex>
  )
}

function MenuFooter() {
  const { handleLogout } = useAuth()

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
