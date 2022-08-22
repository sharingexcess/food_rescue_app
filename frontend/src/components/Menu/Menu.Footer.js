import { Button, Flex } from '@chakra-ui/react'
import { useAuth } from 'hooks'

export function MenuFooter() {
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
