import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useColorMode,
  Flex,
  Spacer,
} from '@chakra-ui/react'
import { useIsMobile } from 'hooks'
import { MenuBody } from './Menu.Body'
import { MenuFooter } from './Menu.Footer'
import { MenuHeader } from './Menu.Header'

export function Menu({ isOpen, onClose }) {
  const { colorMode, toggleColorMode } = useColorMode()
  const isMobile = useIsMobile()

  return isMobile ? (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent bg="surface.card">
        <DrawerCloseButton />
        <DrawerHeader py="0">
          <MenuHeader />
        </DrawerHeader>

        <DrawerBody py="0">
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
      overflow="auto"
    >
      <MenuHeader />
      <MenuBody colorMode={colorMode} toggleColorMode={toggleColorMode} />
      <Spacer />
      <MenuFooter />
    </Flex>
  )
}
