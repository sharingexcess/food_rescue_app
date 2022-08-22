import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, Heading, Image, Text } from '@chakra-ui/react'
import { useAuth } from 'hooks'

export function Landing() {
  const { handleLogin } = useAuth()
  return (
    <Flex direction="column" justify="center" align="center" h="72vh">
      <Image src="/logo.png" w="192px" h="192px" alt="Sharing Excess" mb="8" />
      <Heading align="center">
        Using{' '}
        <Text as="span" color="se.brand.primary">
          surplus
        </Text>{' '}
        as a solution to{' '}
        <Text as="span" color="se.brand.primary">
          scarcity
        </Text>
        .
      </Heading>
      <Box height="8" />
      <Text type="subheader" align="center">
        <strong>Sharing Excess</strong> rescues food from wholesalers, grocery
        stores, and restaurants to help fight food scarcity in local
        communities.
      </Text>
      <Box height="8" />
      <Button size="lg" onClick={handleLogin} leftIcon={<ExternalLinkIcon />}>
        Login with Google
      </Button>
    </Flex>
  )
}
