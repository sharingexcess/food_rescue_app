import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { useIsMobile } from 'hooks'

export function CardOverlay({
  isOpen,
  handleClose,
  CardHeader,
  CardBody,
  CardFooter,
}) {
  const isMobile = useIsMobile()

  return isMobile ? (
    <Drawer isOpen={isOpen} placement="bottom" onClose={handleClose}>
      <DrawerOverlay sx={{ backdropFilter: 'blur(4px)' }} />

      <DrawerContent bg="surface.card" h="84vh" roundedTop="xl">
        <DrawerCloseButton />

        <DrawerHeader>
          <CardHeader />
        </DrawerHeader>

        <DrawerBody>
          <CardBody />
        </DrawerBody>

        <DrawerFooter pb="8">
          <CardFooter />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />

      <ModalContent>
        <ModalCloseButton />

        <ModalHeader>
          <CardHeader />
        </ModalHeader>

        <ModalBody maxH="36vh" overflowY="auto">
          <CardBody />
        </ModalBody>

        <ModalFooter>
          <CardFooter />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
