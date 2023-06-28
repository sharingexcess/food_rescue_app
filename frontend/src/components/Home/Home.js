import { Flex, Heading, Image } from '@chakra-ui/react'
import { useApi, useAuth, useIsMobile } from 'hooks'
import moment from 'moment'
import { useMemo } from 'react'
import { AvailableRescues } from './Home.AvailableRescues'
import { Stats } from './Home.Stats'
import { STATUSES, TRANSFER_TYPES } from 'helpers'

export function Home() {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const { data: distributions } = useApi(
    '/transfers/list',
    useMemo(
      () => ({
        status: STATUSES.COMPLETED,
        type: TRANSFER_TYPES.DISTRIBUTION,
        handler_id: user.id,
        date_range_start: moment().subtract(1, 'year').format('YYYY-MM-DD'),
        date_range_finish: moment().format('YYYY-MM-DD'),
      }),
      []
    )
  )

  const { data: collections } = useApi(
    '/transfers/list',
    useMemo(
      () => ({
        status: STATUSES.COMPLETED,
        type: TRANSFER_TYPES.COLLECTION,
        handler_id: user.id,
        date_range_start: moment().subtract(1, 'year').format('YYYY-MM-DD'),
        date_range_finish: moment().format('YYYY-MM-DD'),
      }),
      []
    )
  )

  const totalWeight = useMemo(
    () =>
      collections &&
      collections.reduce(
        (total, current) => (total += current.total_weight),
        0
      ),
    [collections]
  )

  const totalOrgs = useMemo(() => {
    if (distributions) {
      const orgs = {}
      for (const d of distributions) {
        if (orgs[d.organization.id]) {
          orgs[d.organization.id] += 1
        } else {
          orgs[d.organization.id] = 1
        }
      }
      return Object.keys(orgs).length
    } else return null
  }, [distributions])

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
        distributions={distributions}
      />
      <AvailableRescues />
    </>
  )
}
