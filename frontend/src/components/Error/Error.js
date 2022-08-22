import { Button, Flex, Heading, Link, Text } from '@chakra-ui/react'

export function Error({ crash, message = '' }) {
  const messageText =
    'Looks like there was an error on this page.\n' +
    (typeof message === 'string'
      ? message
      : message.toString
      ? message.toString()
      : JSON.stringify(message))

  return (
    <Flex w="100%" h="64vh" direction="column" justify="center" align="center">
      <Heading color="element.primary" mb="2">
        Uh oh!
      </Heading>
      <Text color="element.secondary" align="center" mb="8">
        {crash
          ? 'Uh oh... looks like something broke on this page.'
          : messageText ||
            "The page you're looking for may have moved, or doesn't exist."}
      </Text>
      <Link href={window.location.href} mb="4">
        <Button>Reload Current Page</Button>
      </Link>
      <Link href="/">
        <Button>Back to Home Page</Button>
      </Link>
    </Flex>
  )
}
