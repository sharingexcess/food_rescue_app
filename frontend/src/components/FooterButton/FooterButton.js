import { Box, Button } from '@chakra-ui/react'
import { useIsMobile } from 'hooks'

export function FooterButton(props) {
  const isMobile = useIsMobile()

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        position={isMobile ? 'fixed' : 'relative'}
        w={isMobile ? 'calc(100% - 32px)' : null}
        bottom={isMobile ? '8' : null}
        left={isMobile ? '4' : null}
        zIndex="8"
        mt="4"
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
    </>
  )
}
