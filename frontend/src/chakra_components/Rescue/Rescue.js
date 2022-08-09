import { Flex, Heading } from '@chakra-ui/react'
import { useApi } from 'hooks'
import { useParams } from 'react-router-dom'
import { createContext, useContext, useMemo, useState } from 'react'
import { Error, Loading } from 'components'
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

  if (loading && !rescue) return <Loading text="Loading Rescue" />
  else if (error) return <Error message={error} />
  else if (!rescue) return <Error message="No Rescue Found" />
  else
    return (
      <Page
        id="Rescue"
        title={`${rescue.status} Rescue`}
        breadcrumbs={[
          { label: 'Rescues', link: '/chakra/rescues' },
          { label: rescue_id, link: `/chakra/rescues/${rescue_id}` },
        ]}
      >
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
          {openStop?.type === 'pickup' ? (
            <Pickup pickup={openStop} />
          ) : (
            <Delivery delivery={openStop} />
          )}
        </RescueContext.Provider>
      </Page>
    )
}
