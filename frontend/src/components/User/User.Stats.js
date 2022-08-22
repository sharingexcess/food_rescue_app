import { Fade, Flex, Heading, Spinner, Text } from '@chakra-ui/react'
import { formatLargeNumber } from 'helpers'
import { useIsMobile } from 'hooks'

export function UserStats({ totalWeight }) {
  const isMobile = useIsMobile()

  return (
    <Fade in>
      <Flex
        mt="8"
        px={isMobile ? '4' : '8'}
        py="4"
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
          <Heading color="element.primary">
            {totalWeight == null ? (
              <Spinner />
            ) : (
              formatLargeNumber(totalWeight) + ' lbs.'
            )}
          </Heading>
          <Text color="se.brand.primary">rescued this year</Text>
        </Flex>
      </Flex>
    </Fade>
  )
}
