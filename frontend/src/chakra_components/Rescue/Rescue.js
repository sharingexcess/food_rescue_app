import {
  Flex,
  Heading,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
} from '@chakra-ui/react'
import { useApi } from 'hooks'
import { useParams } from 'react-router-dom'
import { createContext, useContext, useMemo, useState } from 'react'
import { Ellipsis, Error, Loading } from 'components'
import { Page, Pickup, Delivery } from 'chakra_components'
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
      >
        {children}
      </Page>
    )
  }

  if (loading && !rescue)
    return (
      <RescuePageWrapper>
        <Heading
          as="h1"
          fontWeight="700"
          size="2xl"
          mb="24px"
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
  else if (error)
    return (
      <RescuePageWrapper>
        <Error message={error} />
      </RescuePageWrapper>
    )
  else if (!rescue)
    return (
      <RescuePageWrapper>
        <Error message="No Rescue Found" />
      </RescuePageWrapper>
    )
  else
    return (
      <RescuePageWrapper>
        <RescueContext.Provider value={contextValue}>
          <Heading
            as="h1"
            fontWeight="700"
            size="2xl"
            mb="24px"
            textTransform="capitalize"
            color="element.primary"
          >
            {rescue.status} Rescue
          </Heading>
          <Flex direction="column" w="100%">
            <RescueHeader />
            <RescueStops />
          </Flex>
          <Pickup pickup={openStop?.type === 'pickup' ? openStop : null} />
          <Delivery
            delivery={openStop?.type === 'delivery' ? openStop : null}
          />
        </RescueContext.Provider>
      </RescuePageWrapper>
    )
}
