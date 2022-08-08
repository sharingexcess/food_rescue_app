import { Flex } from '@chakra-ui/react'
import { useApi } from 'hooks'
import { useParams } from 'react-router-dom'
import { createContext, useContext, useMemo, useState } from 'react'
import { Error, Loading } from 'components'
import { Page, EditPickup, EditDelivery } from 'chakra_components'
import { getActiveStop } from './Rescue.utils'
import { RescueHeader, RescueStops } from './Rescue.children'

const RescueContext = createContext({})
RescueContext.displayName = 'RescueContext'
export const useRescueContext = () => useContext(RescueContext)

export function Rescue() {
  const { rescue_id } = useParams()
  const { data: rescue, loading, error } = useApi(`/rescues/${rescue_id}`)
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
  }

  if (loading) return <Loading text="Loading Rescue" />
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
          <Flex direction="column" w="100%">
            <RescueHeader />
            <RescueStops />
          </Flex>
          <EditPickup pickup={openStop} />
          {/* <EditDelivery stop={openStop} /> */}
        </RescueContext.Provider>
      </Page>
    )
}
