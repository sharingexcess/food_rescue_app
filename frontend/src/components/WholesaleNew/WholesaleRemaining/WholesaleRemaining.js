import { Box, VStack, Text } from '@chakra-ui/react'
import { PageTitle } from 'components/PageTitle/PageTitle'
import { useApi } from 'hooks'
import { useMemo, useState } from 'react'
import moment from 'moment'

export function WholesaleRemaining() {
  const [date] = useState(moment().format('YYYY-MM-DDTHH:mm'))

  const { data: rescues } = useApi(
    '/rescues/list',
    useMemo(
      () => ({
        type: 'wholesale',
        date_range_start: date,
        date_range_end: date,
      }),
      [date]
    )
  )

  const calculateRemainingWeight = transfers => {
    const collectionWeight = transfers
      .filter(transfer => transfer.type === 'collection')
      .reduce((acc, curr) => acc + curr.total_weight, 0)

    const distributionWeight = transfers
      .filter(transfer => transfer.type === 'distribution')
      .reduce((acc, curr) => acc + curr.total_weight, 0)

    return collectionWeight - distributionWeight
  }

  return (
    <Box p={4}>
      <PageTitle>Wholesale Remaining</PageTitle>
      {rescues &&
        rescues.map(rescue => {
          const remainingWeight = calculateRemainingWeight(rescue.transfers)
          return (
            <VStack spacing={4} align="start" key={rescue.id}>
              <Box
                padding={4}
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
                w={'100%'}
                mb={4}
              >
                <Text>
                  <strong>Organization:</strong>{' '}
                  {rescue.transfers[0].organization.name || 'N/A'}
                </Text>
                <Text>
                  <strong>Product Type:</strong>{' '}
                  {rescue.transfers[0].product_type}
                </Text>
                <Text>
                  <strong>Remaining Weight:</strong> {remainingWeight} lbs.
                </Text>
              </Box>
            </VStack>
          )
        })}
    </Box>
  )
}
