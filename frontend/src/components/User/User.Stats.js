import { Fade, Flex, Heading, Spinner, Text } from '@chakra-ui/react'
import { formatLargeNumber } from 'helpers'
import { useIsMobile } from 'hooks'

export function UserStats({ totalWeight }) {
  const isMobile = useIsMobile()

  return (
    <Fade in>
      <Flex
        px={isMobile ? '4' : '8'}
        py="3"
        gap="4"
        zIndex="3"
        position="relative"
        direction="column"
      >
        <Flex
          borderRadius="md"
          justify="center"
          align="center"
          direction="column"
          w="100%"
        >
          <Heading size="lg" color="se.brand.primary">
            {totalWeight == null ? (
              <Spinner />
            ) : (
              formatLargeNumber(totalWeight) + ' lbs.'
            )}
          </Heading>
          <Text color="element.tertiary">rescued this year</Text>
        </Flex>
      </Flex>
    </Fade>
  )
}
