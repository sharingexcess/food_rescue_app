import { Button, Flex } from '@chakra-ui/react'
import { useRescueContext, useCollectionContext } from 'components'
import { STATUSES } from 'helpers'
import { useAuth } from 'hooks'
import { NoteInput } from './Collection.NoteInput'

export function CollectionFooter() {
  const { user, hasAdminPermission } = useAuth()
  const { rescue } = useRescueContext()
  const { collection, isSubmitting, handleSubmit, total } =
    useCollectionContext()

  if (!collection) return null
  return (
    <Flex direction="column" w="100%">
      {collection.status !== STATUSES.SCHEDULED && <NoteInput />}
      <Button
        size="lg"
        w="100%"
        disabled={
          // disable button if the network request is loading
          isSubmitting ||
          // disable button if the rescue is not active or complete
          [STATUSES.SCHEDULED, STATUSES.CANCELLED].includes(rescue?.status) ||
          // disable button if the user is not the handler, or an admin
          !(rescue?.handler_id === user.id || hasAdminPermission)
        }
        onClick={handleSubmit}
        isLoading={isSubmitting}
        loadingText="Updating collection..."
      >
        {collection.status === 'completed' ? 'Update' : 'Complete'} Collection
        {rescue?.status === STATUSES.COMPLETED
          ? ''
          : total
          ? ` (${total} lbs.)`
          : ''}
      </Button>
    </Flex>
  )
}
