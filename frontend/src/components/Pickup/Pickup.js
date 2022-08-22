import { CardOverlay, useRescueContext } from 'components'
import { FOOD_CATEGORIES } from 'helpers'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { PickupFooter } from './Pickup.Footer'
import { PickupBody } from './Pickup.Body'
import { PickupHeader } from './Pickup.Header'

const PickupContext = createContext({})
PickupContext.displayName = 'PickupContext'
export const usePickupContext = () => useContext(PickupContext)

export function Pickup({ pickup }) {
  const { setOpenStop } = useRescueContext()
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

  function handleClosePickup() {
    window.sessionStorage.removeItem(session_storage_key)
    setOpenStop(null)
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
