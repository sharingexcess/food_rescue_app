import { CardOverlay, useRescueContext } from 'components'
import { createTimestamp, FOOD_CATEGORIES, SE_API, STATUSES } from 'helpers'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { PickupFooter } from './Pickup.Footer'
import { PickupBody } from './Pickup.Body'
import { PickupHeader } from './Pickup.Header'
import { useAuth } from 'hooks'

const PickupContext = createContext({})
PickupContext.displayName = 'PickupContext'
export const usePickupContext = () => useContext(PickupContext)

export function Pickup({
  pickup,
  handleClosePickupOverride,
  handleSubmitOverride,
}) {
  const { user } = useAuth()
  const { setOpenStop, rescue, refresh } = useRescueContext()
  const [entryRows, setEntryRows] = useState([])
  const [notes, setNotes] = useState('')

  const session_storage_key = useMemo(
    () => (pickup ? `pickup_cache_${pickup.id}` : undefined),
    [pickup]
  )
  const isChanged = window.sessionStorage.getItem(session_storage_key)

  useEffect(() => {
    const sessionObject = sessionStorage.getItem(session_storage_key)

    if (sessionObject) {
      const { sessionEntryRows, sessionNotes } = JSON.parse(sessionObject)
      setEntryRows(sessionEntryRows)
      setNotes(sessionNotes)
    } else if (pickup) {
      const initialEntryRows = []
      for (const category of FOOD_CATEGORIES) {
        if (pickup[category]) {
          initialEntryRows.push({
            category: category,
            weight: pickup[category],
          })
        }
      }
      setEntryRows(initialEntryRows)
      setNotes(pickup.notes)
    }
  }, [pickup])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const total = entryRows.reduce((total, current) => total + current.weight, 0)

  async function handleSubmit() {
    if (handleSubmitOverride) {
      handleSubmitOverride({ entryRows, notes, total, id: pickup.id })
    } else {
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

      sessionStorage.removeItem(session_storage_key)
      setIsSubmitting(false)
      setOpenStop(null)
      refresh()
    }
  }

  function handleClosePickup() {
    if (handleClosePickupOverride) {
      handleClosePickupOverride()
    } else {
      window.sessionStorage.removeItem(session_storage_key)
      setOpenStop(null)
    }
  }

  function verifyClose() {
    if (isChanged) {
      return window.confirm(
        'You have unsaved changes on this pickup. Are you sure you want to exit?'
      )
    } else return true
  }

  const pickupContextValue = {
    pickup,
    entryRows,
    setEntryRows,
    notes,
    setNotes,
    session_storage_key,
    isChanged,
    handleSubmit,
    isSubmitting,
    total,
  }

  return (
    <PickupContext.Provider value={pickupContextValue}>
      <CardOverlay
        isOpen={!!pickup}
        closeHandler={handleClosePickup}
        preCloseHandler={verifyClose}
        CardHeader={PickupHeader}
        CardBody={PickupBody}
        CardFooter={PickupFooter}
      />
    </PickupContext.Provider>
  )
}
