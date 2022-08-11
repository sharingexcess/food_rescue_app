import {
  Box,
  Flex,
  Heading,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
} from '@chakra-ui/react'
import { useApi, useIsMobile } from 'hooks'
import { useParams } from 'react-router-dom'
import { createContext, useContext, useMemo, useState } from 'react'
import { Error, Loading } from 'components'
import { Page, Pickup, Delivery, Directions } from 'chakra_components'
import { getActiveStop } from './Rescue.utils'
import { RescueHeader, RescueStops } from './Rescue.children'

const RescueContext = createContext({})
RescueContext.displayName = 'RescueContext'
export const useRescueContext = () => useContext(RescueContext)

export function Rescue() {
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

  const contextValue = {
    rescue,
    activeStop,
    expandedStop,
    setExpandedStop,
    openStop,
    setOpenStop,
    refresh,
  }

  function RescuePageWrapper({ children }) {
    return (
      <Page
        id="Rescue"
        title="Rescue"
        breadcrumbs={[
          { label: 'Rescues', link: '/chakra/rescues' },
          {
            label: `${rescue?.status || 'Loading'} Rescue`,
            link: `/chakra/rescues/${rescue_id}`,
          },
        ]}
        contentProps={{ px: 0, pt: 8, mt: '-64px' }}
      >
        {children}
      </Page>
    )
  }

  if (loading && !rescue)
    return <LoadingRescue RescuePageWrapper={RescuePageWrapper} />
  else if (error)
    return (
      <RescuePageError RescuePageWrapper={RescuePageWrapper} message={error} />
    )
  else if (!rescue)
    return (
      <RescuePageError
        RescuePageWrapper={RescuePageWrapper}
        message="No Rescue Found"
      />
    )
  else
    return (
      <RescuePageWrapper>
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
            <Heading
              as="h1"
              fontWeight="700"
              size="2xl"
              textTransform="capitalize"
              color="element.primary"
            >
              {rescue.status} Rescue
            </Heading>
            <Flex direction="column" w="100%">
              <RescueHeader />
              <RescueStops />
            </Flex>
          </Box>
          <Pickup pickup={openStop?.type === 'pickup' ? openStop : null} />
          <Delivery
            delivery={openStop?.type === 'delivery' ? openStop : null}
          />
        </RescueContext.Provider>
      </RescuePageWrapper>
    )
}

// Alternate States for Loading/Error

export function LoadingRescue({ RescuePageWrapper }) {
  return (
    <RescuePageWrapper>
      <Skeleton h="48" my="4" />
      <Heading
        as="h1"
        fontWeight="700"
        size="2xl"
        mb="6"
        textTransform="capitalize"
        color="element.primary"
      >
        Loading Rescue...
      </Heading>
      <SkeletonCircle w="100%" h="16" my="8" />
      <Skeleton h="32" my="4" />
      <Skeleton h="32" my="4" />
      <Skeleton h="32" my="4" />
    </RescuePageWrapper>
  )
}

export function RescuePageError({ RescuePageWrapper, message }) {
  return (
    <RescuePageWrapper>
      <Error message={message} />
    </RescuePageWrapper>
  )
}
