import { Box, Button, Flex, Heading, Image, Link, Text } from '@chakra-ui/react'
import { useAuth, useIsMobile } from 'hooks'
import { LandingHeader } from './Landing.Header'

export function Landing() {
  const { handleLogin } = useAuth()
  const isMobile = useIsMobile()

  return (
    <Box
      w="100%"
      p="8"
      maxW="1000px"
      mx="auto"
      minW={isMobile ? null : '800px'}
    >
      <LandingHeader />

      <Flex
        direction={isMobile ? 'column' : 'row'}
        justify="space-between"
        align="center"
        w="100%"
        py={isMobile ? '16' : '24'}
        gap="16"
      >
        <Box flexBasis="50%" flexGrow="1">
          <Heading
            align="left"
            as="h1"
            size="3xl"
            lineHeight="1.2"
            fontWeight="800"
            mb="8"
          >
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
          <Text color="element.secondary" align="left" fontWeight="400" mb="8">
            <strong>Sharing Excess</strong> rescues food from wholesalers,
            grocery stores, and restaurants to help fight food scarcity in local
            communities.
          </Text>
          <Button width="100%" size="lg" onClick={handleLogin}>
            Start Rescuing Food
          </Button>
          <Link
            href="https://sharingexcess.com"
            isExternal
            w="100%"
            my="4"
            display="block"
          >
            <Button variant="tertiary" w="100%">
              Learn More
            </Button>
          </Link>
        </Box>
        <Flex direction="column" flexBasis="50%">
          <Image src="/landing-img.svg" w="100%" alt="Sharing Excess" mb="8" />
        </Flex>
      </Flex>

      <Flex
        direction="column"
        backgroundColor="element.subtle"
        px={isMobile ? '4' : '16'}
        py="12"
        w="100%"
        borderRadius="xl"
        boxShadow="lg"
        mt="12"
        mb="16"
      >
        <Heading align="center" size="4xl" mb="8">
          🎉
        </Heading>
        <Heading align="center" size="lg" lineHeight="1.4" mb="8">
          Our volunteers have helped to rescue
          {isMobile ? ' ' : <br />}over{' '}
          <Text as="span" color="se.brand.primary">
            10,000,000 lbs.{' '}
          </Text>
          of food since 2018!
        </Heading>
        <Text color="element.secondary" align="center" fontWeight="400">
          The <strong>Sharing Excess Food Rescue App</strong> connects
          volunteers with donation ready food from local grocery stores and
          restaurants, helping all of us work together in the fight against food
          waste.
        </Text>
      </Flex>

      <Flex
        direction={isMobile ? 'column' : 'row'}
        justify="space-between"
        align="center"
        w="100%"
        py="12"
        gap="12"
      >
        <Image
          src="/active-preview.svg"
          flexBasis="50%"
          w={isMobile ? '100%' : null}
          flexGrow="1"
          alt="Sharing Excess"
        />
        <Box flexBasis="50%" flexGrow="1">
          <Heading align="left" mb="4">
            Help Us Fight Hunger, On Your Schedule
          </Heading>
          <Text color="element.secondary" align="left" fontWeight="400">
            As a volunteer with Sharing Excess, you can schedule your own food
            rescues, and help deliver fresh food to local nonprofits and food
            pantries.
          </Text>
        </Box>
      </Flex>

      <Flex
        direction={isMobile ? 'column-reverse' : 'row'}
        justify="space-between"
        align="center"
        w="100%"
        py="12"
        gap="12"
      >
        <Box flexBasis="50%" flexGrow="1">
          <Heading align={isMobile ? 'left' : 'right'} mb="4">
            Make An Impact In Your Community
          </Heading>
          <Text
            mb="8"
            color="element.secondary"
            align={isMobile ? 'left' : 'right'}
            fontWeight="400"
          >
            Help us rescue and deliver fresh food to local nonprofits and mutual
            aid efforts that need it most, using surplus to fight scarcity.
          </Text>
        </Box>
        <Image
          src="/home-preview.svg"
          flexBasis="50%"
          w={isMobile ? '100%' : null}
          flexGrow="1"
          alt="Sharing Excess"
        />
      </Flex>

      <Flex
        direction={isMobile ? 'column' : 'row'}
        justify="space-between"
        align="center"
        w="100%"
        py="12"
        gap="12"
      >
        <Image
          src="/people-preview.svg"
          flexBasis="50%"
          w={isMobile ? '100%' : null}
          flexGrow="1"
          alt="Sharing Excess"
        />
        <Box flexBasis="50%" flexGrow="1">
          <Heading align="left" mb="4">
            Join the Sharing Excess Community
          </Heading>
          <Text color="element.secondary" align="left" fontWeight="400">
            From food rescue, to popup food distributions, to events like our
            annual Free Food Fest - sign up to be a part of our movement!
          </Text>
        </Box>
      </Flex>

      <Flex
        direction="column"
        backgroundColor="element.subtle"
        px={isMobile ? '4' : '16'}
        py="12"
        w="100%"
        borderRadius="xl"
        boxShadow="lg"
        mt="12"
        mb="16"
      >
        <Heading align="center" size="4xl" mb="8">
          🏃
        </Heading>
        <Heading align="center" size="lg" lineHeight="1.4">
          Let's get you on board!
        </Heading>
        <Box height="8" />
        <Text color="element.secondary" align="center" fontWeight="400" mb="8">
          Create a volunteer profile in seconds, and start rescuing food in your
          local community. We can't wait to meet you!
        </Text>
        <Button size="lg" onClick={handleLogin}>
          Get Started
        </Button>
      </Flex>

      <Flex
        as="footer"
        pt="12"
        direction={isMobile ? 'column' : 'row'}
        justify="space-between"
        align="center"
        gap="4"
      >
        <Flex align="center" gap="4" direction={isMobile ? 'column' : 'row'}>
          <Image w={isMobile ? '16' : '8'} src="/logo.png" />
          <Text fontSize="sm" color="element.primary" align="left">
            © {new Date().getFullYear()} Sharing Excess
          </Text>
        </Flex>
        <Text
          fontSize="8px"
          color="element.tertiary"
          align={isMobile ? 'center' : 'right'}
          maxW="480px"
          flexShrink={1}
        >
          Sharing Excess is a registered 501(c)(3) nonprofit organization
          therefore all donations are tax-deductible. Nonprofit Tax ID/EIN:
          23-1630073. “Sharing Excess” is a registered trademark (TM). All
          rights reserved.
        </Text>
      </Flex>
    </Box>
  )
}
