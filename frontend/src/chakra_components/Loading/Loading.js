import { Flex, Heading, Image, keyframes, Fade } from '@chakra-ui/react'
import { Page } from 'chakra_components'
import { Ellipsis } from 'components'
import { motion } from 'framer-motion'

export function Loading({ text = 'Loading' }) {
  const animation = `${keyframes`
    0% { transform: scale(1.02); opacity: 1; }
    50% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.02); opacity: 1; }
  `} 2s ease-in-out infinite`

  return (
    <Page
      title="Loading"
      pullToRefresh={false}
      contentProps={{ overflow: 'hidden', maxH: '100vh' }}
    >
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
    </Page>
  )
}
