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
  const { setOpenTransfer, refresh } = useRescueContext()
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
    }
  }, [distribution, currentLoad])

  const canEdit = useMemo(() => {
    return (
      ![STATUSES.CANCELLED].includes(distribution?.status) &&
      (rescue?.handler_id === user.id || hasAdminPermission)
    )
  }, [distribution])

  async function handleSubmit() {
    if (handleSubmitOverride) {
      handleSubmitOverride({ id: distribution.id, percentTotalDropped, notes })
    } else {
      setIsSubmitting(true)

      let total_weight = 0
      const categorized_weight = calculateCurrentCategorizedLoad(
        rescue,
        distribution
      )

      console.log(categorized_weight)

      for (const category in categorized_weight) {
        const category_weight = Math.round(
          (categorized_weight[category] * percentTotalDropped) / 100
        )
        categorized_weight[category] = category_weight
        total_weight += category_weight
      }

      const payload = {
        id: distribution.id,
        type: TRANSFER_TYPES.DISTRIBUTION,
        status: STATUSES.COMPLETED,
        rescue_id: rescue.id,
        handler_id: rescue.handler_id,
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
      }

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
