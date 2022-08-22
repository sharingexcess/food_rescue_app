import { Button, Flex } from '@chakra-ui/react'
import { useAuth } from 'hooks'
import { Link } from 'react-router-dom'

export function MenuFooter() {
  const { handleLogout } = useAuth()

  return (
    <Flex justify="space-around" w="100%">
      <Button variant="link" size="xs" onClick={handleLogout}>
        Logout
      </Button>
      <Link to="/legal">
        <Button variant="link" size="xs">
          Legal
        </Button>
      </Link>
      <Link to="/privacy">
        <Button variant="link" size="xs">
          Privacy Policy
        </Button>
      </Link>
    </Flex>
  )
}
