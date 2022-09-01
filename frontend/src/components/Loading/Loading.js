import { Flex, Heading, Image, keyframes, Fade, Button } from '@chakra-ui/react'
import { Ellipsis } from 'components'
import { motion } from 'framer-motion'

export function Loading({ text = 'Loading', action }) {
  const animation = `${keyframes`
    0% { transform: scale(1.02); opacity: 1; }
    50% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.02); opacity: 1; }
  `} 2s ease-in-out infinite`

  console.log(action)
  return (
    <>
      <Fade in>
        <Flex
          w="100%"
          h="64vh"
          justify="center"
          align="center"
          as={motion.div}
          animation={animation}
          direction="column"
        >
          <Image w="48" src="/logo.png" alt="Sharing Excess" mb="8" />
          <Heading>
            {text}
            <Ellipsis />
          </Heading>
        </Flex>
      </Fade>

      {action && (
        <Flex w="100%" justify="center">
          <Button variant="secondary" onClick={() => action.handler()} mt="8">
            {action.label}
          </Button>
        </Flex>
      )}
    </>
  )
}
