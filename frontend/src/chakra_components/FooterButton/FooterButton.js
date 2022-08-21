import { Button } from '@chakra-ui/react'
import { useIsMobile } from 'hooks'

export function FooterButton(props) {
  const isMobile = useIsMobile()

  return (
    <Button
      size="lg"
      position={isMobile ? 'fixed' : 'relative'}
      w={isMobile ? 'calc(100% - 32px)' : null}
      bottom={isMobile ? '4' : null}
      left={isMobile ? '4' : null}
      zIndex="8"
      mt="4"
      {...props}
    >
      {props.children}
    </Button>
  )
}
