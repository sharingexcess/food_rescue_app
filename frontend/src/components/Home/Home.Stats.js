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
import { useEffect, useState } from 'react'

export function Stats({ totalWeight, totalOrgs, deliveries }) {
  const isMobile = useIsMobile()
  const { colorMode } = useColorMode()
  const cachedTotalWeight = localStorage.getItem('se_stats_total_weight')
  const cachedTotalOrgs = localStorage.getItem('se_stats_total_orgs')
  const cachedTotalDeliveries = localStorage.getItem(
    'se_stats_total_deliveries'
  )
  const [stats, setStats] = useState({
    totalWeight: totalWeight || cachedTotalWeight,
    totalOrgs: totalOrgs || cachedTotalOrgs,
    totalDeliveries: deliveries?.length || cachedTotalDeliveries,
  })

  // cache stats locally for improved load time
  useEffect(() => {
    if (totalWeight) {
      localStorage.setItem('se_stats_total_weight', totalWeight)
      setStats(stats => ({ ...stats, totalWeight }))
    }
    if (totalOrgs) {
      localStorage.setItem('se_stats_total_orgs', totalOrgs)
      setStats(stats => ({ ...stats, totalOrgs }))
    }
    if (deliveries?.length) {
      localStorage.setItem('se_stats_total_deliveries', deliveries.length)
      setStats(stats => ({ ...stats, totalDeliveries: deliveries.length }))
    }
  }, [totalOrgs, totalWeight, deliveries])

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
            {stats.totalWeight == null ? (
              <Spinner />
            ) : (
              formatLargeNumber(stats.totalWeight) + ' lbs.'
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
            {stats.totalDeliveries || <Spinner />}
          </Heading>
          <Text color="element.tertiary">deliveries this year</Text>
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
          mr="2"
        >
          <Heading
            color={
              colorMode === 'dark' ? 'element.primary' : 'se.brand.primary'
            }
          >
            {stats.totalOrgs || <Spinner />}
          </Heading>
          <Text color="element.tertiary">individual recipients</Text>
        </Flex>
      </Flex>
    </Fade>
  )
}
