import { useRescueContext, CardOverlay } from 'components'
import {
  STATUSES,
  calculateCurrentLoad,
  calculateCurrentCategorizedLoad,
  SE_API,
  TRANSFER_TYPES,
} from 'helpers'
import { useAuth } from 'hooks'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Footer } from './Distribution.Footer'
import { Body } from './Distribution.Body'
import { Header } from './Distribution.Header'
import moment from 'moment'

const DistributionContext = createContext({})
DistributionContext.displayName = 'DistributionContext'
export const useDistributionContext = () => useContext(DistributionContext)

export function Distribution({
  distribution,
  rescueOverride,
  handleCloseDistributionOverride,
  handleSubmitOverride,
}) {
  const { hasAdminPermission, user } = useAuth()
  const { setOpenTransfer, refresh, activeTransfer } = useRescueContext()
  let { rescue } = useRescueContext()
  // allow for override here to support log rescue functionality
  rescue = rescueOverride || rescue

  const [notes, setNotes] = useState('')
  const [percentTotalDropped, setPercentTotalDropped] = useState(100)
  const currentLoad = useMemo(
    () => calculateCurrentLoad(rescue, distribution),
    [rescue, distribution]
  )
  const [poundsDropped, setPoundsDropped] = useState(currentLoad)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedAt, setCompletedAt] = useState()

  useEffect(() => {
    if (distribution && currentLoad) {
      setNotes(distribution.notes)
      setPercentTotalDropped(
        distribution.status === STATUSES.COMPLETED
          ? parseFloat(
              Math.round((distribution.total_weight / currentLoad) * 100)
            )
          : 100
      )
      setPoundsDropped(
        distribution.status === STATUSES.COMPLETED
          ? distribution.total_weight
          : currentLoad
      )
      setCompletedAt(
        distribution.timestamp_completed
          ? moment(distribution.timestamp_completed).format('YYYY-MM-DDTHH:mm')
          : null
      )
    }
  }, [distribution, currentLoad])

  const canEdit = useMemo(() => {
    return (
      (activeTransfer?.id === distribution?.id ||
        distribution?.status === STATUSES.COMPLETED) &&
      (rescue?.handler_id === user.id || hasAdminPermission)
    )
  }, [distribution])

  async function handleSubmit() {
    let total_weight = 0
    const categorized_weight = calculateCurrentCategorizedLoad(
      rescue,
      distribution
    )

    for (const category in categorized_weight) {
      const category_weight = Math.round(
        (categorized_weight[category] * percentTotalDropped) / 100
      )
      categorized_weight[category] = category_weight
      total_weight += category_weight
    }

    const payload = {
      type: TRANSFER_TYPES.DISTRIBUTION,
      status: STATUSES.COMPLETED,
      organization_id: distribution.organization_id,
      location_id: distribution.location_id,
      notes,
      timestamp_completed:
        // automatically set timestamp completed if this is being submitted for the first time
        distribution.status === STATUSES.SCHEDULED
          ? moment().toISOString()
          : moment(completedAt).toISOString(),
      total_weight,
      categorized_weight,
      percent_of_total_dropped: percentTotalDropped,
    }

    // add the id to the payload
    // note: we do this separately to account for "LogRescue"
    // which uses this component to build a distribution
    // before it's created in the db (hence there's no id)
    if (distribution.id) {
      payload.id = distribution.id
    }
    if (rescue) {
      payload.rescue_id = rescue.id
      payload.handler_id = rescue.handler_id
      payload.rescue_scheduled_time = rescue.timestamp_scheduled || null
    }

    if (handleSubmitOverride) {
      handleSubmitOverride(payload)
    } else {
      setIsSubmitting(true)

      await SE_API.post(
        `/transfers/update/${distribution.id}`,
        payload,
        user.accessToken
      )

      setIsSubmitting(false)
      setOpenTransfer(null)
      refresh()
    }
  }

  function handleCloseDistribution() {
    if (handleCloseDistributionOverride) {
      handleCloseDistributionOverride()
    } else {
      setOpenTransfer(null)
    }
  }

  const distributionContextValue = {
    distribution,
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
    completedAt,
    setCompletedAt,
  }

  return (
    <DistributionContext.Provider value={distributionContextValue}>
      <CardOverlay
        isOpen={!!distribution}
        closeHandler={handleCloseDistribution}
        CardHeader={Header}
        CardBody={Body}
        CardFooter={Footer}
      />
    </DistributionContext.Provider>
  )
}
