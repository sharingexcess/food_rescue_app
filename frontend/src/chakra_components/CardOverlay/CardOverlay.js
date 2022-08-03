import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Heading,
} from '@chakra-ui/react'

export function CardOverlay({ isOpen, onClose }) {
  return (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
      <DrawerOverlay sx={{ backdropFilter: 'blur(4px)' }} />
      <DrawerContent
        bg="surface.card"
        h="84vh"
        // sx={{ borderRadius: '16px 16px 0 0 ' }}
        roundedTop="xl"
      >
        <DrawerCloseButton />
        <DrawerHeader>
          <Heading as="h2">This is the Heading</Heading>
        </DrawerHeader>

        <DrawerBody py="8">This is the drawer body</DrawerBody>

        <DrawerFooter>
          <Button size="lg" width="100%">
            This is the Primary Action
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
