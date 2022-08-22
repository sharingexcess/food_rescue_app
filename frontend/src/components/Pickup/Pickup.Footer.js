import { Button, Flex } from '@chakra-ui/react'
import { useRescueContext, usePickupContext } from 'components'
import { createTimestamp, FOOD_CATEGORIES, SE_API, STATUSES } from 'helpers'
import { useAuth } from 'hooks'
import { useState } from 'react'
import { NoteInput } from './Pickup.NoteInput'

export function PickupFooter() {
  const { user, hasAdminPermission } = useAuth()
  const { setOpenStop, refresh, rescue } = useRescueContext()
  const { entryRows, notes, pickup, session_storage_key, isChanged } =
    usePickupContext()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const total = entryRows.reduce((total, current) => total + current.weight, 0)

  async function handleSubmit() {
    setIsSubmitting(true)

    const formData = {
      ...FOOD_CATEGORIES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}),
      impact_data_total_weight: 0,
      notes: '',
    }

    for (const row of entryRows) {
      formData[row.category] = formData[row.category] + row.weight
    }
    formData.impact_data_total_weight = total
    formData.notes = notes
    await SE_API.post(
      `/stops/${pickup.id}/update`,
      {
        ...formData,
        status: STATUSES.COMPLETED,
        timestamp_logged_finish: createTimestamp(),
      },
      user.accessToken
    )
    const stop_index = rescue.stop_ids.findIndex(i => i === pickup.id)
    if (stop_index < rescue.stop_ids.length - 1) {
      // if this is not the last stop, mark the next stop as active
      await SE_API.post(
        `/stops/${rescue.stop_ids[stop_index + 1]}/update`,
        {
          status: STATUSES.ACTIVE,
        },
        user.accessToken
      )
    }

    sessionStorage.removeItem(session_storage_key)
    setIsSubmitting(false)
    setOpenStop(null)
    refresh()
  }

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
          !(rescue.handler_id === user.id || hasAdminPermission)
        }
        onClick={handleSubmit}
        isLoading={isSubmitting}
        loadingText="Updating Pickup"
      >
        {pickup.status === 'completed' ? 'Update' : 'Complete'} Pickup
        {total ? ` (${total} lbs.)` : ''}
      </Button>
    </Flex>
  )
}
