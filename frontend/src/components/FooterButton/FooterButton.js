import { Box, Button, Flex } from '@chakra-ui/react'
import { useIsMobile } from 'hooks'

export function FooterButton(props) {
  const isMobile = useIsMobile()

  return (
    <Flex w="100%" align="center" justify="center">
      <Button
        variant="primary"
        size="lg"
        position={isMobile ? 'fixed' : 'relative'}
        w={isMobile ? 'calc(100% - 32px)' : null}
        bottom={isMobile ? '8' : null}
        left={isMobile ? 'max(16px, calc(50vw - 360px))' : null}
        zIndex="8"
        mt="4"
        maxW="720px"
        {...props}
      >
        {props.children}
      </Button>
      {isMobile && (
        <Box
          position="fixed"
          w="100%"
          h="32"
          bottom="0"
          left="0"
          zIndex="7"
          bgGradient="linear(to bottom, transparent, surface.background)"
        />
      )}
    </Flex>
  )
}
