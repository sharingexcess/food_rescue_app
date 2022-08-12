import {
  Box,
  Button,
  Fade,
  Flex,
  Heading,
  Image,
  Spinner,
  Text,
  useColorMode,
} from '@chakra-ui/react'
import { Page, RescueCard } from 'chakra_components'

import { useApi, useAuth, useIsMobile } from 'hooks'
import moment from 'moment'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

export function Home() {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const { data: deliveries } = useApi(
    '/stops',
    useMemo(
      () => ({
        status: 'completed',
        handler_id: user.id,
        date_range_start: moment().subtract(1, 'year').format('YYYY-MM-DD'),
        date_range_finish: moment().format('YYYY-MM-DD'),
      }),
      []
    )
  )

  const totalWeight = useMemo(
    () =>
      deliveries &&
      deliveries.reduce(
        (total, current) => (total += current.impact_data_total_weight),
        0
      ),
    [deliveries]
  )

  const totalOrgs = useMemo(() => {
    if (deliveries) {
      const orgs = {}
      for (const d of deliveries) {
        if (orgs[d.organization.id]) {
          orgs[d.organization.id] += 1
        } else {
          orgs[d.organization.id] = 1
        }
      }
      console.log(orgs)
      return Object.keys(orgs).length
    } else return null
  }, [deliveries])

  return (
    <Page title="Home" contentProps={{ px: 0, pt: 8, mt: '-64px' }}>
      <Flex
        w="100%"
        h="32vh"
        direction="column"
        justify="center"
        align="start"
        borderRadius={isMobile ? '0' : 'lg'}
        overflow="hidden"
        zIndex="0"
        position="relative"
      >
        <Heading
          as="h1"
          zIndex="3"
          color="se.gray.100"
          px={isMobile ? '4' : '8'}
          pt="8"
          fontWeight="800"
          size="xl"
        >
          Hey {user.name.split(' ')[0]}!
        </Heading>
        <Heading
          as="h3"
          zIndex="3"
          color="se.gray.100"
          px={isMobile ? '4' : '8'}
          fontWeight="300"
          size="lg"
        >
          Welcome back.
        </Heading>
        <Image
          zIndex="2"
          position="absolute"
          w="100%"
          h="100%"
          objectFit="cover"
          src={isMobile ? '/home_bg_mobile.png' : '/home_bg_desktop.png'}
        />
      </Flex>
      <Stats
        totalWeight={totalWeight}
        totalOrgs={totalOrgs}
        deliveries={deliveries}
      />
      <AvailableRescues />
      <RescuesButton />
    </Page>
  )
}

function Stats({ totalWeight, totalOrgs, deliveries }) {
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
            {totalWeight ? totalWeight + ' lbs.' : <Spinner />}
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
            {deliveries?.length || <Spinner />}
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
            {totalOrgs || <Spinner />}
          </Heading>
          <Text color="element.tertiary">different recipients</Text>
        </Flex>
      </Flex>
    </Fade>
  )
}

function AvailableRescues() {
  const { data: availableRescues } = useApi(
    '/rescues',
    useMemo(() => ({ status: 'scheduled', handler_id: 'null' }), [])
  )
  const isMobile = useIsMobile()

  return (
    <Box px={isMobile ? '4' : '8'} pt="8">
      <Heading as="h4" color="element.secondary" fontSize="lg" my="0">
        Available Rescues
      </Heading>
      {availableRescues &&
        availableRescues.map(rescue => (
          <RescueCard key={rescue.id} rescue={rescue} />
        ))}
      {availableRescues &&
        availableRescues.map(rescue => (
          <RescueCard key={rescue.id} rescue={rescue} />
        ))}
      {availableRescues &&
        availableRescues.map(rescue => (
          <RescueCard key={rescue.id} rescue={rescue} />
        ))}
      {availableRescues &&
        availableRescues.map(rescue => (
          <RescueCard key={rescue.id} rescue={rescue} />
        ))}
      {availableRescues &&
        availableRescues.map(rescue => (
          <RescueCard key={rescue.id} rescue={rescue} />
        ))}
    </Box>
  )
}

function RescuesButton() {
  const isMobile = useIsMobile()

  if (!isMobile) return null
  return (
    <Link to="/chakra/rescues">
      <Button
        position="fixed"
        bottom="8"
        left="4"
        w="calc(100% - 32px)"
        size="lg"
      >
        View All Rescues
      </Button>
    </Link>
  )
}
