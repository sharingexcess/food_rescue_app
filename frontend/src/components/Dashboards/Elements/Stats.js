import { Box, Flex, Text, Spinner } from '@chakra-ui/react'
import { useIsMobile } from 'hooks'
import { useEffect, useState } from 'react'
import { formatLargeNumber, calculateDashboardMetrics } from './helper'

export function Stats({
  transfers,
  organizations,
  orgId,
  isStatsLoading,
  orgType,
}) {
  const isMobile = useIsMobile()
  const [metrics, setMetrics] = useState({})

  useEffect(() => {
    if (transfers) {
      const metrics = calculateDashboardMetrics(transfers, organizations, orgId)
      setMetrics(metrics)
    }
  }, [transfers])

  return (
    <>
      {isStatsLoading ? (
        <Flex
          direction="column"
          p={5}
          w={'100%'}
          alignItems="center"
          height="fit-content"
        >
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Flex
          direction="column"
          p={5}
          w={'100%'}
          borderRadius="lg"
          boxShadow="lg"
          alignItems="center"
          height="fit-content"
          bg="#e3e3e3"
        >
          {[
            {
              label: `Food ${
                orgType === 'donor' ? 'Donated to' : 'Recieved from'
              } SE`,
              value: metrics.total_weight,
              color: 'green.500',
            },
            {
              label: `Meals ${orgType === 'donor' ? 'Provided' : 'Recieved'}`,
              value: metrics.meals_provided,
              color: 'purple.500',
            },
            {
              label: 'Carbon Emissions Avoided',
              value: parseInt(metrics.emissions_reduced),
              color: 'blue.500',
            },
            {
              label: 'Retail Value',
              value: '$ ' + metrics.retail_value,
              color: 'orange.500',
            },
            {
              label: 'Fair Market Value',
              value: '$ ' + metrics.fair_market_value,
              color: 'red.500',
            },
          ].map((item, index) => (
            <Box
              key={index}
              py={3}
              display={'flex'}
              alignContent={'center'}
              flexDirection={'column'}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <Text fontSize={'lg'} color="gray.700" fontWeight="medium">
                {item.label}
              </Text>
              <Text
                fontSize={isMobile ? '3xl' : '4xl'}
                fontWeight="bold"
                color={item.color}
              >
                {formatLargeNumber(item.value)}{' '}
                {item.label === 'Meals Recieved' ||
                item.label === 'Meals Provided'
                  ? ''
                  : 'lbs'}
              </Text>
            </Box>
          ))}
        </Flex>
      )}
    </>
  )
}
