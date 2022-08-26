import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, Heading, Image, Text } from '@chakra-ui/react'
import { useAuth } from 'hooks'

export function Landing() {
  const { handleLogin } = useAuth()
  return (
    <>
      <Flex direction="row" justify="center" align="center" h="72vh">
        <Flex direction="column" w="80%">
          <Heading align="left">
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
          <Text type="subheader" align="left" fontWeight="400">
            <strong>Sharing Excess</strong> rescues food from wholesalers,
            grocery stores, and restaurants to help fight food scarcity in local
            communities.
          </Text>
          <Box height="8" />
          <Button width="xs" size="lg" onClick={handleLogin}>
            Start Rescuing Food
          </Button>
        </Flex>
        <Flex direction="column" w="50%" ml="16">
          <Image
            src="/landing-img.svg"
            w="192px"
            h="192px"
            alt="Sharing Excess"
            mb="8"
          />
        </Flex>
      </Flex>

      <Flex direction="column" backgroundColor="#F0F0F1" py="12">
        <Heading align="center">🎉</Heading>
        <Box height="8" />
        <Heading align="center" size="lg">
          Food Rescue App has allowed{' '}
          <Text as="span" color="se.brand.primary">
            Sharing Excess
          </Text>{' '}
          to rescue{' '}
          <Text as="span" color="se.brand.primary">
            10,000 lbs.{' '}
          </Text>
          of food.
        </Heading>
        <Box height="8" />
        <Text type="subheader" align="center" fontWeight="400">
          <strong>Sharing Excess</strong> rescues food from wholesalers, grocery
          stores, and restaurants to help fight food scarcity in local
          communities.
        </Text>
        <Box height="8" />
      </Flex>

      <Box height="36" />

      <Flex direction="row" justify="center" align="center">
        <Flex direction="column" w="50%">
          <Heading align="left">Join Our Community</Heading>
          <Box height="8" />
          <Text type="subheader" align="left" fontWeight="400">
            Description of this section in the Food Rescue App you can create
            rescues for drivers to rescue food driving delivery and vocabulary
            dummy text.
          </Text>
          <Box height="8" />
        </Flex>
        <Flex direction="column" w="50%" ml="16">
          <Image
            src="/people-preview.svg"
            w="192px"
            h="192px"
            alt="Sharing Excess"
          />
        </Flex>
      </Flex>

      <Box height="36" />

      <Flex direction="row" justify="center" align="center">
        <Flex direction="column" w="50%" ml="16">
          <Image
            src="/active-preview.svg"
            w="192px"
            h="192px"
            alt="Sharing Excess"
          />
        </Flex>
        <Flex direction="column" w="50%">
          <Heading align="left">Rescue Food on Your Schedule</Heading>
          <Box height="8" />
          <Text type="subheader" align="left" fontWeight="400">
            Description of this section in the Food Rescue App you can create
            rescues for drivers to rescue food driving delivery and vocabulary
            dummy text.
          </Text>
          <Box height="8" />
        </Flex>
      </Flex>

      <Box height="36" />

      <Flex direction="row" justify="center" align="center">
        <Flex direction="column" w="50%">
          <Heading align="left">Create Meaningful Impact</Heading>
          <Box height="8" />
          <Text type="subheader" align="left" fontWeight="400">
            Description of this section in the Food Rescue App you can create
            rescues for drivers to rescue food driving delivery and vocabulary
            dummy text.
          </Text>
          <Box height="8" />
        </Flex>
        <Flex direction="column" w="50%" ml="16">
          <Image
            src="/home-preview.svg"
            w="192px"
            h="192px"
            alt="Sharing Excess"
          />
        </Flex>
      </Flex>
    </>
  )
}
