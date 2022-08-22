import { useRescueContext, CardOverlay } from 'components'
import { STATUSES, calculateCurrentLoad } from 'helpers'
import { useAuth } from 'hooks'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Footer } from './Delivery.Footer'
import { Body } from './Delivery.Body'
import { Header } from './Delivery.Header'

const DeliveryContext = createContext({})
DeliveryContext.displayName = 'DeliveryContext'
export const useDeliveryContext = () => useContext(DeliveryContext)

export function Delivery({ delivery }) {
  const { hasAdminPermission, user } = useAuth()
  const { setOpenStop, rescue } = useRescueContext()
  const [notes, setNotes] = useState('')
  const [percentTotalDropped, setPercentTotalDropped] = useState(100)
  const currentLoad = useMemo(
    () => calculateCurrentLoad(rescue, delivery),
    [rescue, delivery]
  )
  const [poundsDropped, setPoundsDropped] = useState(currentLoad)

  useEffect(() => {
    if (delivery && currentLoad) {
      setNotes(delivery.notes)
      setPercentTotalDropped(parseInt(delivery.percent_of_total_dropped))
      setPoundsDropped(
        parseInt(currentLoad * (delivery.percent_of_total_dropped / 100))
      )
    }
  }, [delivery, currentLoad])

  const canEdit = useMemo(() => {
    return (
      ![STATUSES.CANCELLED, STATUSES.SCHEDULED].includes(delivery?.status) &&
      (rescue.handler_id === user.id || hasAdminPermission)
    )
  }, [delivery])

  const deliveryContextValue = {
    delivery,
    notes,
    setNotes,
    percentTotalDropped,
    setPercentTotalDropped,
    poundsDropped,
    setPoundsDropped,
    currentLoad,
    canEdit,
  }

  return (
    <DeliveryContext.Provider value={deliveryContextValue}>
      <CardOverlay
        isOpen={!!delivery}
        closeHandler={() => setOpenStop(null)}
        CardHeader={Header}
        CardBody={Body}
        CardFooter={Footer}
      />
    </DeliveryContext.Provider>
  )
}
