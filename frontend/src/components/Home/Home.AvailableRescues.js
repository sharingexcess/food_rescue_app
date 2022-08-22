import { Box, Button, Flex, Heading, Skeleton, Text } from '@chakra-ui/react'
import { RescueCard, FooterButton } from 'components'
import { useApi, useIsMobile } from 'hooks'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

export function AvailableRescues() {
  const isMobile = useIsMobile()
  const { data: availableRescues } = useApi(
    '/rescues',
    useMemo(() => ({ status: 'scheduled', handler_id: 'null' }), [])
  )

  function ShowAvailableRescues() {
    return (
      <Box pb="24">
        {availableRescues.map(rescue => (
          <RescueCard key={rescue.id} rescue={rescue} />
        ))}
      </Box>
    )
  }

  function NoAvailableRescues() {
    return (
      <Flex direction="column" align="center" w="100%" py="8">
        <Heading size="xl" color="element.secondary" mb="4">
          😐
        </Heading>
        <Heading
          as="h4"
          size="sm"
          color="element.secondary"
          align="center"
          mb="2"
        >
          There are currently no available rescues.
        </Heading>
        <Box px={'4'}>
          <Text align="center" fontSize="sm" color="element.secondary">
            Check back another time if you'd like to claim a rescue!
          </Text>
        </Box>
      </Flex>
    )
  }

  function LoadingAvailableRescues() {
    return (
      <Box mt="6">
        <Skeleton h="32" w="100%" my="4" />
        <Skeleton h="32" w="100%" my="4" />
        <Skeleton h="32" w="100%" my="4" />
      </Box>
    )
  }

  return (
    <Box px={isMobile ? '4' : '8'} pt="8">
      <Flex w="100%" justify="space-between" align="center">
        <Heading as="h4" color="element.primary" fontSize="lg" my="0">
          Available Rescues
        </Heading>
        {!isMobile && (
          <Link to="/rescues">
            <Button variant="tertiary" size="sm">
              View All Rescues
            </Button>
          </Link>
        )}
      </Flex>
      {availableRescues ? (
        availableRescues.length ? (
          <ShowAvailableRescues />
        ) : (
          <NoAvailableRescues />
        )
      ) : (
        <LoadingAvailableRescues />
      )}
      {isMobile && (
        <Link to="/rescues">
          <FooterButton>View All Rescues</FooterButton>
        </Link>
      )}
    </Box>
  )
}
