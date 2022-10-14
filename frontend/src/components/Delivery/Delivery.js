import { useRescueContext, CardOverlay } from 'components'
import {
  STATUSES,
  calculateCurrentLoad,
  SE_API,
  createTimestamp,
} from 'helpers'
import { useAuth } from 'hooks'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Footer } from './Delivery.Footer'
import { Body } from './Delivery.Body'
import { Header } from './Delivery.Header'

const DeliveryContext = createContext({})
DeliveryContext.displayName = 'DeliveryContext'
export const useDeliveryContext = () => useContext(DeliveryContext)

export function Delivery({
  delivery,
  rescueOverride,
  handleCloseDeliveryOverride,
  handleSubmitOverride,
}) {
  const { hasAdminPermission, user } = useAuth()
  const { setOpenStop, refresh } = useRescueContext()
  let { rescue } = useRescueContext()
  // allow for override here to support log rescue functionality
  rescue = rescueOverride || rescue
  const [notes, setNotes] = useState('')
  const [percentTotalDropped, setPercentTotalDropped] = useState(100)
  const currentLoad = useMemo(
    () => calculateCurrentLoad(rescue, delivery),
    [rescue, delivery]
  )
  const [poundsDropped, setPoundsDropped] = useState(currentLoad)

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (delivery && currentLoad) {
      setNotes(delivery.notes)
      setPercentTotalDropped(parseInt(delivery.percent_of_total_dropped) || 100)
      setPoundsDropped(
        parseInt(currentLoad * (delivery.percent_of_total_dropped / 100))
      )
    }
  }, [delivery, currentLoad])

  const canEdit = useMemo(() => {
    return (
      ![STATUSES.CANCELLED, STATUSES.SCHEDULED].includes(delivery?.status) &&
      (rescue?.handler_id === user.id || hasAdminPermission)
    )
  }, [delivery])

  async function handleSubmit() {
    if (handleSubmitOverride) {
      handleSubmitOverride({ id: delivery.id, percentTotalDropped, notes })
    } else {
      setIsSubmitting(true)
      const payload = {
        percent_of_total_dropped: percentTotalDropped,
        notes: notes,
        timestamp_logged_finish:
          delivery?.timestamp_logged_finish || createTimestamp(),
        timestamp_updated: createTimestamp(),
        status: STATUSES.COMPLETED,
      }
      await SE_API.post(
        `/stops/${delivery.id}/update`,
        payload,
        user.accessToken
      )

      const stop_index = rescue.stop_ids.findIndex(i => i === delivery.id)
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

      setIsSubmitting(false)
      setOpenStop(null)
      refresh()
    }
  }

  function handleCloseDelivery() {
    if (handleCloseDeliveryOverride) {
      handleCloseDeliveryOverride()
    } else {
      setOpenStop(null)
    }
  }

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
    handleSubmit,
    isSubmitting,
  }

  return (
    <DeliveryContext.Provider value={deliveryContextValue}>
      <CardOverlay
        isOpen={!!delivery}
        closeHandler={handleCloseDelivery}
        CardHeader={Header}
        CardBody={Body}
        CardFooter={Footer}
      />
    </DeliveryContext.Provider>
  )
}
