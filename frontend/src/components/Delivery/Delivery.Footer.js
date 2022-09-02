import { Button, Flex } from '@chakra-ui/react'
import { useRescueContext, useDeliveryContext } from 'components'
import { createTimestamp, SE_API, STATUSES } from 'helpers'
import { useAuth } from 'hooks'
import { useState } from 'react'
import { NoteInput } from './Delivery.NoteInput'

export function Footer() {
  const { setOpenStop, refresh, rescue } = useRescueContext()
  const { notes, delivery, canEdit, percentTotalDropped } = useDeliveryContext()
  const { user } = useAuth()

  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    setIsSubmitting(true)
    const payload = {
      percent_of_total_dropped: percentTotalDropped,
      notes: notes,
      timestamp_logged_finish:
        delivery?.timestamp_logged_finish || createTimestamp(),
      timestamp_updated: createTimestamp(),
      status: STATUSES.COMPLETED,
    }
    await SE_API.post(`/stops/${delivery.id}/update`, payload, user.accessToken)

    const stop_index = rescue.stop_ids.findIndex(i => i === delivery.id)
    if (
      stop_index < rescue.stop_ids.length - 1 &&
      rescue.stops[stop_index + 1].status === STATUSES.SCHEDULED
    ) {
      // if this is not the last stop, mark the next stop as active
      await SE_API.post(
        `/stops/${rescue.stop_ids[stop_index + 1]}/update`,
        {
          status: STATUSES.ACTIVE,
        },
        user.accessToken
      )
    }

    setIsSubmitting(false)
    setOpenStop(null)
    refresh()
  }

  if (!delivery) return null
  return (
    <Flex direction="column" w="100%">
      {delivery.status !== STATUSES.SCHEDULED && <NoteInput />}
      <Button
        size="lg"
        w="100%"
        disabled={!canEdit || isSubmitting}
        isLoading={isSubmitting}
        loadingText="Updating delivery..."
        onClick={handleSubmit}
      >
        {delivery.status === 'completed' ? 'Update' : 'Complete'} Delivery
      </Button>
    </Flex>
  )
}
