import { Flex, Heading, Image } from '@chakra-ui/react'
import { useApi, useAuth, useIsMobile } from 'hooks'
import moment from 'moment'
import { useMemo } from 'react'
import { AvailableRescues } from './Home.AvailableRescues'
import { Stats } from './Home.Stats'

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
      return Object.keys(orgs).length
    } else return null
  }, [deliveries])

  return (
    <>
      <Flex
        w="100%"
        h="38vh"
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
          color="se.gray.50"
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
          color="se.gray.50"
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
    </>
  )
}
