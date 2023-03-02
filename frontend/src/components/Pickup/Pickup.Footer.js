import { Button, Flex } from '@chakra-ui/react'
import { useRescueContext, usePickupContext } from 'components'
import { STATUSES } from 'helpers'
import { useAuth } from 'hooks'
import { NoteInput } from './Pickup.NoteInput'

export function PickupFooter() {
  const { user, hasAdminPermission } = useAuth()
  const { rescue } = useRescueContext()
  const { pickup, isSubmitting, handleSubmit, total } = usePickupContext()

  if (!pickup) return null
  return (
    <Flex direction="column" w="100%">
      {pickup.status !== STATUSES.SCHEDULED && <NoteInput />}
      <Button
        size="lg"
        w="100%"
        disabled={
          // disable button if the network request is loading
          isSubmitting ||
          // disable button if the rescue is not active or complete
          [STATUSES.SCHEDULED, STATUSES.CANCELLED].includes(rescue.status) ||
          // disable button if the user is not the handler, or an admin
          !(rescue?.handler_id === user.id || hasAdminPermission)
        }
        onClick={handleSubmit}
        isLoading={isSubmitting}
        loadingText="Updating pickup..."
      >
        {pickup.status === 'completed' ? 'Update' : 'Complete'} Pickup
        {total ? ` (${total} lbs.)` : ''}
      </Button>
    </Flex>
  )
}
