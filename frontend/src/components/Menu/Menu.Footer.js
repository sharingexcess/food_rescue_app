import { Button, Flex, Text } from '@chakra-ui/react'
import { VERSION } from 'helpers'
import { useAuth } from 'hooks'
import { useNavigate } from 'react-router-dom'

export function MenuFooter() {
  const { handleLogout, user } = useAuth()
  const navigate = useNavigate()

  return (
    <Flex justify="space-around" w="100%" align="center">
      {VERSION && (
        <Text fontSize="xs" lineHeight="1" color="element.secondary">
          v{VERSION}
        </Text>
      )}
      <Button
        variant="link"
        size="xs"
        textDecoration="underline"
        onClick={() => navigate('/legal')}
        disabled={!user}
      >
        Legal
      </Button>
      <Button
        variant="link"
        size="xs"
        textDecoration="underline"
        onClick={() => navigate('/privacy')}
        disabled={!user}
      >
        Privacy Policy
      </Button>
      {user && (
        <Button
          variant="link"
          size="xs"
          lineHeight="1"
          textDecoration="underline"
          onClick={() =>
            window.confirm('Are you sure you want to log out?') &&
            handleLogout()
          }
        >
          Logout
        </Button>
      )}
    </Flex>
  )
}
