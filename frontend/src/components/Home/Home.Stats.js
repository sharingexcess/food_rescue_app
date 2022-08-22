import {
  Fade,
  Flex,
  Heading,
  Spinner,
  Text,
  useColorMode,
} from '@chakra-ui/react'
import { formatLargeNumber } from 'helpers'
import { useIsMobile } from 'hooks'

export function Stats({ totalWeight, totalOrgs, deliveries }) {
  const isMobile = useIsMobile()
  const { colorMode } = useColorMode()

  return (
    <Fade in>
      <Flex
        mt="-16"
        px={isMobile ? '4' : '8'}
        py="4"
        gap="4"
        zIndex="3"
        position="relative"
        overflowX="auto"
      >
        <Flex
          p="4"
          borderRadius="md"
          boxShadow="md"
          bg="surface.card"
          justify="center"
          align="start"
          direction="column"
          flexShrink="0"
          flexGrow="1"
        >
          <Heading
            color={
              colorMode === 'dark' ? 'element.primary' : 'se.brand.primary'
            }
          >
            {totalWeight == null ? (
              <Spinner />
            ) : (
              formatLargeNumber(totalWeight) + ' lbs.'
            )}
          </Heading>
          <Text color="element.tertiary">rescued this year</Text>
        </Flex>
        <Flex
          p="4"
          borderRadius="md"
          boxShadow="md"
          bg="surface.card"
          justify="center"
          align="start"
          direction="column"
          flexShrink="0"
          flexGrow="1"
        >
          <Heading
            color={
              colorMode === 'dark' ? 'element.primary' : 'se.brand.primary'
            }
          >
            {deliveries ? deliveries.length : <Spinner />}
          </Heading>
          <Text color="element.tertiary">rescues this year</Text>
        </Flex>
        <Flex
          p="4"
          borderRadius="md"
          boxShadow="md"
          bg="surface.card"
          justify="center"
          align="start"
          direction="column"
          flexShrink="0"
          flexGrow="1"
        >
          <Heading
            color={
              colorMode === 'dark' ? 'element.primary' : 'se.brand.primary'
            }
          >
            {totalOrgs == null ? <Spinner /> : totalOrgs}
          </Heading>
          <Text color="element.tertiary">individual recipients</Text>
        </Flex>
      </Flex>
    </Fade>
  )
}
