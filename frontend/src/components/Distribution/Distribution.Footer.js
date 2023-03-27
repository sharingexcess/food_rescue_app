import { Button, Flex } from '@chakra-ui/react'
import { useDistributionContext } from 'components'
import { STATUSES } from 'helpers'
import { NoteInput } from './Distribution.NoteInput'

export function Footer() {
  const { distribution, canEdit, isSubmitting, handleSubmit } =
    useDistributionContext()

  if (!distribution) return null

  return (
    <Flex direction="column" w="100%">
      <NoteInput />
      <Button
        size="lg"
        w="100%"
        disabled={!canEdit || isSubmitting}
        isLoading={isSubmitting}
        loadingText="Updating distribution..."
        onClick={handleSubmit}
      >
        {distribution.status === STATUSES.COMPLETED ? 'Update ' : 'Complete '}
        Distribution
      </Button>
    </Flex>
  )
}
