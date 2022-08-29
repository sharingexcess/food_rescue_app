import { Flex, Text } from '@chakra-ui/react'
import { useApi, useAuth } from 'hooks'
import moment from 'moment'
import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'

export function CompletedResue() {
  const { rescue_id } = useParams()
  const { user } = useAuth()
  // const { data: rescue } = useApi(`/rescues/${rescue_id}`)

  const { data: deliveries } = useApi(
    '/stops',
    useMemo(
      () => ({
        rescue_id: rescue_id,
        handler_id: user.id,
        status: 'completed',
        date_range_start: moment().subtract(1, 'days').format('YYYY-MM-DD'),
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

  useEffect(() => console.log('hello', totalWeight), [deliveries])

  return (
    <Flex direction="column">
      <Text as="h1" fontSize="6xl" fontWeight={700}>
        Route Finished
      </Text>
      <Text as="p">Thank you for driving with Sharing Excess!</Text>
      <Text>
        You rescued{' '}
        <Text as="span" color="element.success">
          {totalWeight} lbs.
        </Text>{' '}
        of food today.
      </Text>
    </Flex>
  )
}
