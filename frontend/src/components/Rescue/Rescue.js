import { Box, Flex, Skeleton, SkeletonCircle } from '@chakra-ui/react'
import { useApi, useAuth, useIsMobile } from 'hooks'
import { useParams } from 'react-router-dom'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  PageTitle,
  Collection,
  Directions,
  Error,
  CompletedRescue,
  Distribution,
} from 'components'
import { getActiveTransfer } from './Rescue.utils'
import { RescueHeader } from './Rescue.Header'
import { RescueTransfers } from './Rescue.Transfers'
import { RescueActionButtons } from './Rescue.ActionButtons'
import { calculateCurrentLoad, SE_API, STATUSES } from 'helpers'
import moment from 'moment'

const RescueContext = createContext({})
RescueContext.displayName = 'RescueContext'
export const useRescueContext = () => useContext(RescueContext)

export function Rescue({ setBreadcrumbs, setTitle }) {
  const { rescue_id } = useParams()
  const {
    data: rescue,
    loading,
    error,
    refresh,
  } = useApi(`/rescues/get/${rescue_id}`)
  const { user } = useAuth()
  const [expandedTransfer, setExpandedTransfer] = useState(null)
  const [openTransfer, setOpenTransfer] = useState(null)
  const [showCompletedPopup, setShowCompletedPopup] = useState(false)
  const activeTransfer = useMemo(() => getActiveTransfer(rescue), [rescue])
  const isMobile = useIsMobile()

  useEffect(() => {
    setTitle(rescue ? `Rescue` : 'Loading rescue...')
    setBreadcrumbs([
      { label: 'Rescues', link: '/rescues' },
      {
        label: `${rescue?.status || ''} Rescue`,
        link: `/rescues/${rescue_id}`,
      },
    ])
  }, [rescue])

  // handle auto complete rescue
  useEffect(() => {
    const remainingWeight = calculateCurrentLoad(rescue)
    // we declare rescue complete if the final transfer is complete,
    // and the remaining weight is less than the number of transfers,
    // which leaves room for a rounding off by 1 error on each transfer
    if (
      rescue?.status === STATUSES.ACTIVE &&
      remainingWeight < rescue.transfers.length &&
      rescue.transfers[rescue.transfers.length - 1].status ===
        STATUSES.COMPLETED
    ) {
      SE_API.post(
        `/rescues/update/${rescue.id}`,
        {
          id: rescue.id,
          type: rescue.type,
          status: STATUSES.COMPLETED,
          handler_id: rescue.handler_id,
          notes: rescue.notes,
          timestamp_scheduled: rescue.timestamp_scheduled,
          timestamp_completed: moment().toISOString(),
          transfer_ids: rescue.transfer_ids,
        },
        user.accessToken
      )
      setShowCompletedPopup(true)
    }
  }, [rescue, user])

  const contextValue = {
    rescue,
    activeTransfer,
    expandedTransfer,
    setExpandedTransfer,
    openTransfer,
    setOpenTransfer,
    refresh,
  }

  if (loading && !rescue) return <LoadingRescue />
  else if (error) return <RescuePageError message={error} />
  else if (!rescue) return <RescuePageError message="No Rescue Found" />
  else
    return (
      <RescueContext.Provider value={contextValue}>
        <Directions transfers={rescue.transfers} />
        <Flex
          bgGradient="linear(to-b, transparent, surface.background)"
          h="24"
          mt="-24"
          zIndex={1}
          position="relative"
          direction="column"
          justify="flex-end"
        />
        <Box
          px={isMobile ? '4' : '0'}
          mt={isMobile ? '4' : '4'}
          zIndex="2"
          position="relative"
        >
          <PageTitle>{rescue.status} Rescue</PageTitle>
          <Flex direction="column" w="100%">
            <RescueHeader />
            <RescueActionButtons />
            <RescueTransfers />
          </Flex>
        </Box>
        <Collection
          collection={openTransfer?.type === 'collection' ? openTransfer : null}
        />
        <Distribution
          distribution={
            openTransfer?.type === 'distribution' ? openTransfer : null
          }
        />
        <CompletedRescue
          isOpen={showCompletedPopup}
          handleClose={() => setShowCompletedPopup(false)}
        />
      </RescueContext.Provider>
    )
}

function LoadingRescue() {
  const isMobile = useIsMobile()
  return (
    <Box px="4">
      <Skeleton h="320px" mt={isMobile ? '64px' : 0} />
      <PageTitle mt="4">Loading Rescue...</PageTitle>
      <SkeletonCircle w="100%" h="16" my="4" />
      <SkeletonCircle w="100%" h="12" my="4" />
      <Skeleton h="32" my="4" />
      <Skeleton h="32" my="4" />
      <Skeleton h="32" my="4" />
    </Box>
  )
}

function RescuePageError({ message }) {
  return <Error message={message} />
}
