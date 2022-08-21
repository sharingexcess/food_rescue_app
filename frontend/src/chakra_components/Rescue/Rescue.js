import { Box, Flex, Skeleton, SkeletonCircle } from '@chakra-ui/react'
import { useApi, useIsMobile } from 'hooks'
import { useParams } from 'react-router-dom'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Error } from 'components'
import { PageTitle, Pickup, Delivery, Directions } from 'chakra_components'
import { getActiveStop } from './Rescue.utils'
import { RescueHeader, RescueStops } from './Rescue.children'

const RescueContext = createContext({})
RescueContext.displayName = 'RescueContext'
export const useRescueContext = () => useContext(RescueContext)

export function Rescue({ setBreadcrumbs }) {
  const { rescue_id } = useParams()
  const {
    data: rescue,
    loading,
    error,
    refresh,
  } = useApi(`/rescues/${rescue_id}`)
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
          h="32"
          mt="-32"
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
            <RescueStops />
          </Flex>
        </Box>
        <Pickup pickup={openStop?.type === 'pickup' ? openStop : null} />
        <Delivery delivery={openStop?.type === 'delivery' ? openStop : null} />
      </RescueContext.Provider>
    )
}

// Alternate States for Loading/Error

function LoadingRescue() {
  const isMobile = useIsMobile()
  return (
    <Box px="4">
      <Skeleton h="320px" mt={isMobile ? '64px' : 0} />
      <PageTitle>Loading Rescue...</PageTitle>
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
