import { Box, Flex, Skeleton, SkeletonCircle } from '@chakra-ui/react'
import { useApi, useAuth, useIsMobile } from 'hooks'
import { useParams, useNavigate } from 'react-router-dom'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { PageTitle, Pickup, Delivery, Directions, Error } from 'components'
import { getActiveStop } from './Rescue.utils'
import { RescueHeader } from './Rescue.Header'
import { RescueStops } from './Rescue.Stops'
import { RescueActionButtons } from './Rescue.ActionButtons'
import {
  calculateCurrentLoad,
  createTimestamp,
  SE_API,
  STATUSES,
} from 'helpers'

const RescueContext = createContext({})
RescueContext.displayName = 'RescueContext'
export const useRescueContext = () => useContext(RescueContext)

export function Rescue({ setBreadcrumbs }) {
  const { rescue_id } = useParams()
  const navigate = useNavigate()
  const {
    data: rescue,
    loading,
    error,
    refresh,
  } = useApi(`/rescues/${rescue_id}`)
  const { user } = useAuth()
  const [expandedStop, setExpandedStop] = useState(null)
  const [openStop, setOpenStop] = useState(null)
  const activeStop = useMemo(() => getActiveStop(rescue), [rescue])
  const isMobile = useIsMobile()

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Rescues', link: '/rescues' },
      {
        label: `${rescue?.status || 'Loading'} Rescue`,
        link: `/rescues/${rescue_id}`,
      },
    ])
  }, [rescue])

  // handle auto complete rescue
  useEffect(() => {
    const remainingWeight = calculateCurrentLoad(rescue)
    // we declare rescue complete if the final stop is complete,
    // and the remaining weight is less than the number of stops,
    // which leaves room for a rounding off by 1 error on each stop
    if (
      rescue?.status === STATUSES.ACTIVE &&
      remainingWeight < rescue.stops.length &&
      rescue.stops[rescue.stops.length - 1].status === STATUSES.COMPLETED
    ) {
      SE_API.post(
        `/rescues/${rescue.id}/update`,
        {
          status: STATUSES.COMPLETED,
          timestamp_logged_finish: createTimestamp(),
          timestamp_updated: createTimestamp(),
        },
        user.accessToken
      )
      navigate(`/rescues/${rescue_id}/completed`)
    }
  }, [rescue, user])

  const contextValue = {
    rescue,
    activeStop,
    expandedStop,
    setExpandedStop,
    openStop,
    setOpenStop,
    refresh,
  }

  if (loading && !rescue) return <LoadingRescue />
  else if (error) return <RescuePageError message={error} />
  else if (!rescue) return <RescuePageError message="No Rescue Found" />
  else
    return (
      <RescueContext.Provider value={contextValue}>
        <Directions stops={rescue.stops} />
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
            <RescueStops />
          </Flex>
        </Box>
        <Pickup pickup={openStop?.type === 'pickup' ? openStop : null} />
        <Delivery delivery={openStop?.type === 'delivery' ? openStop : null} />
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
