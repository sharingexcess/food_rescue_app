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

export function Stats({ totalWeight, totalOrgs, distributions }) {
  const isMobile = useIsMobile()
  const { colorMode } = useColorMode()
  const cachedTotalWeight = localStorage.getItem('se_stats_total_weight')
  const cachedTotalOrgs = localStorage.getItem('se_stats_total_orgs')
  const cachedTotalDistributions = localStorage.getItem(
    'se_stats_total_distributions'
  )
  const [stats, setStats] = useState({
    totalWeight: totalWeight || cachedTotalWeight,
    totalOrgs: totalOrgs || cachedTotalOrgs,
    totalDistributions: distributions?.length || cachedTotalDistributions,
  })

  // cache stats locally for improved load time
  useEffect(() => {
    if (totalWeight != null) {
      localStorage.setItem('se_stats_total_weight', totalWeight)
      setStats(stats => ({ ...stats, totalWeight }))
    }
    if (totalOrgs != null) {
      localStorage.setItem('se_stats_total_orgs', totalOrgs)
      setStats(stats => ({ ...stats, totalOrgs }))
    }
    if (distributions != null) {
      localStorage.setItem('se_stats_total_distributions', distributions.length)
      setStats(stats => ({
        ...stats,
        totalDistributions: distributions.length,
      }))
    }
  }, [totalOrgs, totalWeight, distributions])

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
            {stats.totalDistributions != null ? (
              formatLargeNumber(stats.totalDistributions)
            ) : (
              <Spinner />
            )}
          </Heading>
          <Text color="element.tertiary">distributions this year</Text>
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
            {stats.totalOrgs != null ? (
              formatLargeNumber(stats.totalOrgs)
            ) : (
              <Spinner />
            )}
          </Heading>
          <Text color="element.tertiary">individual recipients</Text>
        </Flex>
      </Flex>
    </Fade>
  )
}
