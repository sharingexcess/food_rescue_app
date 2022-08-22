import { Box, Button, Flex, Heading, Image, Text } from '@chakra-ui/react'
import { useIsMobile } from 'hooks'

export function Landing({ handleLogin }) {
  const isMobile = useIsMobile()

  const BACKGROUND_IMAGE = isMobile
    ? '/LandingImage/hero_background_mobile.png'
    : '/LandingImage/hero_background.png'
  return (
    <main id="Landing">
      <Flex direction="column" id="Hero">
        <Image
          id="Hero-background"
          src={BACKGROUND_IMAGE}
          alt="Hero Background"
        />

        <Heading>
          Using <span className="green">surplus</span>
          <Box height={4} />
          as a solution to <span className="green">scarcity</span>.
        </Heading>
        <Box height="8" />
        <Text type="subheader" align="center">
          <strong>Sharing Excess</strong> rescues food from wholesalers, grocery
          stores, and restaurants to help fight food scarcity in our community.
        </Text>
        <Box height="8" />
        <Button size="lg" onClick={handleLogin}>
          Start Saving Food
        </Button>
      </Flex>
    </main>
  )
}
