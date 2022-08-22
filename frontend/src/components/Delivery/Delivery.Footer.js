import { Button, Flex } from '@chakra-ui/react'
import { useRescueContext, useDeliveryContext, Ellipsis } from 'components'
import { createTimestamp, SE_API, STATUSES } from 'helpers'
import { useAuth } from 'hooks'
import { useState } from 'react'
import { NoteInput } from './Delivery.NoteInput'

export function Footer() {
  const { setOpenStop, refresh } = useRescueContext()
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
    setIsSubmitting(false)
    setOpenStop(null)
    refresh()
  }

  return (
    <Flex direction="column" w="100%">
      {delivery.status !== STATUSES.SCHEDULED && <NoteInput />}
      <Button
        size="lg"
        w="100%"
        disabled={!canEdit}
        isLoading={isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? (
          <>
            Updating Delivery
            <Ellipsis />
          </>
        ) : (
          <>
            {delivery.status === 'completed' ? 'Update' : 'Complete'} Delivery
          </>
        )}
      </Button>
    </Flex>
  )
}
