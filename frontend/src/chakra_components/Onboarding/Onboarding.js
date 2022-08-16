import {
  background,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
} from '@chakra-ui/react'
import { InstallApp, Page, FoodSafety, Profile } from 'chakra_components'
import { useEffect, useState } from 'react'

export function Onboarding() {
  // const cached_stage = sessionStorage.getItem('se_onboarding_stage')
  const cached_stage = 0
  const [stage, setStage] = useState(cached_stage || 0)
  const [showProgress, setShowProgress] = useState(true)

  useEffect(() => {
    sessionStorage.setItem('se_onboarding_stage', stage)
  }, [stage])

  function handleNext() {
    setStage(current => current + 1)
    setShowProgress(true)
  }

  function Progress() {
    const content = [
      {
        image: '/onboarding_stage_0.png',
        header: 'Welcome to Food Rescue!',
        body: "We'll walk you through the basics so you can get right to rescuing food.",
        button: "Let's Go!",
      },
      {
        image: '/onboarding_stage_1.png',
        header: 'Food Safety Rules',
        body: "We'll walk you through all the important things to know about produce pickup and delivery.",
        button: 'Get Started',
      },
      {
        image: '/onboarding_stage_2.png',
        header: 'Complete Your Profile',
        body: 'Your public profile controls how other volunteers see you on the app.',
        button: 'Go to Profile',
      },
    ]
    return (
      <Page title="Getting Started" id="Onboarding">
        <Heading
          as="h1"
          fontWeight="700"
          size="2xl"
          textTransform="capitalize"
          color="element.primary"
        >
          Getting Started
        </Heading>
        <Image
          src={content[stage].image}
          alt="Getting Started"
          w="64%"
          maxW="300px"
          mx="auto"
          my="8"
        />
        <Heading
          as="h3"
          fontWeight="700"
          size="md"
          color="element.primary"
          align="center"
          mb="2"
        >
          {content[stage].header}
        </Heading>
        <Text mb="8" color="element.secondary" align="center">
          {content[stage].body}
        </Text>
        <Flex w="100%" justify="center" onClick={() => setShowProgress(false)}>
          <Button>{content[stage].button}</Button>
        </Flex>
        <Flex w="100%" justify="center" gap="4" mt="10">
          {[0, 1, 2].map(i => (
            <Box
              key={i}
              w="2"
              h="2"
              borderRadius="xl"
              bg="se.brand.primary"
              opacity={stage === i ? 1 : 0.3}
            />
          ))}
        </Flex>
      </Page>
    )
  }

  if (showProgress) return <Progress />

  switch (stage) {
    case 0:
      return <InstallApp handleNext={handleNext} />
    case 1:
      return <FoodSafety handleNext={handleNext} />
    case 2:
      return <Profile />
    default:
      return null
  }
}
