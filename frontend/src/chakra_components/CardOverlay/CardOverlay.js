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
import { useEffect, useState } from 'react'

export function CardOverlay({
  isOpen,
  closeHandler,
  preCloseHandler,
  CardHeader,
  CardBody,
  CardFooter,
}) {
  const isMobile = useIsMobile()
  // create a copy of the open state to allow
  // for a delayed state change, letting the
  // closing animation play
  const [open, setOpen] = useState(isOpen)

  useEffect(() => setOpen(isOpen), [isOpen])

  function closeWithAnimation() {
    // if there's a close handler, only close if it evaluates true
    if (!preCloseHandler || preCloseHandler()) {
      setOpen(false)
      setTimeout(closeHandler, 200)
    } else return
  }

  return isMobile ? (
    <Drawer isOpen={open} placement="bottom" onClose={closeWithAnimation}>
      <DrawerOverlay backdropFilter="blur(4px)" />

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
    <Modal isOpen={open} onClose={closeWithAnimation}>
      <ModalOverlay />

      <ModalContent bg="surface.card">
        <ModalCloseButton />

        <ModalHeader pt="8">
          <CardHeader />
        </ModalHeader>

        <ModalBody maxH="60vh" overflowY="auto">
          <CardBody />
        </ModalBody>

        <ModalFooter>
          <CardFooter />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
