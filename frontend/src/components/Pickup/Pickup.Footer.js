import { Button, Flex } from '@chakra-ui/react'
import { useRescueContext, usePickupContext } from 'components'
import { STATUSES } from 'helpers'
import { useAuth } from 'hooks'
import { NoteInput } from './Pickup.NoteInput'

export function PickupFooter() {
  const { user, hasAdminPermission } = useAuth()
  const { rescue } = useRescueContext()
  const { pickup, isChanged, isSubmitting, handleSubmit, total } =
    usePickupContext()

  if (!pickup) return null
  return (
    <Flex direction="column" w="100%">
      {pickup.status !== STATUSES.SCHEDULED && <NoteInput />}
      <Button
        size="lg"
        w="100%"
        disabled={
          total < 1 ||
          isSubmitting ||
          !isChanged ||
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
