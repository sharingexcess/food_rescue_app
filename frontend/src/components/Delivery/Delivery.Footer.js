import { Button, Flex } from '@chakra-ui/react'
import { useDeliveryContext } from 'components'
import { STATUSES } from 'helpers'
import { NoteInput } from './Delivery.NoteInput'

export function Footer() {
  const { delivery, canEdit, isSubmitting, handleSubmit } = useDeliveryContext()

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
