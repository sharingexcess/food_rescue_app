import { CheckCircleIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  Text,
  OrderedList,
  ListItem,
  Image,
} from '@chakra-ui/react'
import { PageTitle, FooterButton } from 'components'
import { useState } from 'react'
import { Navigate } from 'react-router'

export function InstallApp({ handleNext }) {
  const [os, setOS] = useState(getMobileOperatingSystem())

  function getMobileOperatingSystem() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera

    if (/android/i.test(userAgent)) {
      return 'android'
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return 'iOS'
    } else return 'iOS' // default to iOS for now
  }

  return (
    <>
      <PageTitle>
        Installing the
        <br />
        Food Rescue App
      </PageTitle>
      <Text mb="8">
        The Food Rescue App works best when it's installed on your mobile
        device, so you can be sure to have easy access on the road. Follow the
        instructions for your device to get set up.
      </Text>
      <Flex gap="4" mb="8">
        <Button
          w="100%"
          size="sm"
          variant={os === 'iOS' ? 'primary' : 'secondary'}
          onClick={() => setOS('iOS')}
        >
          iOS
        </Button>
        <Button
          w="100%"
          size="sm"
          variant={os === 'android' ? 'primary' : 'secondary'}
          onClick={() => setOS('android')}
        >
          Android
        </Button>
      </Flex>
      {os === 'iOS' ? (
        <>
          <OrderedList mb="8">
            <ListItem py="2">Make sure you're using Safari!</ListItem>
            <ListItem py="2">
              In the footer, click the
              <Image
                src="/ios_share_icon.png"
                alt="Share"
                display="inline"
                verticalAlign="middle"
                w="8"
              />{' '}
              button
            </ListItem>
            <ListItem py="2">Scroll down to "Add to Home Screen"</ListItem>
          </OrderedList>
          <Image src="/ios_install.png" alt="Install iOS" h="64vh" mx="auto" />
        </>
      ) : os === 'android' ? (
        <>
          <OrderedList mb="8">
            <ListItem py="2">Make sure you're using Chrome!</ListItem>
            <ListItem py="2">
              In the header, click the menu button (3 vertical dots)
            </ListItem>
            <ListItem py="2">Tap "Add to Home Screen"</ListItem>
          </OrderedList>
          <Image
            src="/android_install.png"
            alt="Install Android"
            h="64vh"
            mx="auto"
          />
        </>
      ) : (
        <Navigate to="/" />
      )}
      <Text align="center" mt="8">
        You're all set! Can't wait to have you on board 💚
      </Text>
      <Flex w="100%" justify="center" mt="4" mb="8">
        <FooterButton leftIcon={<CheckCircleIcon />} onClick={handleNext}>
          Next
        </FooterButton>
      </Flex>
    </>
  )
}
