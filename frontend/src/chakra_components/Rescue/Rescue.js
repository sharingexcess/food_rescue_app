import { Flex } from '@chakra-ui/react'
import { useApi } from 'hooks'
import { useParams } from 'react-router-dom'
import { createContext, useContext, useMemo, useState } from 'react'
import { Page } from 'chakra_components/Page/Page'
import { CardOverlay } from 'chakra_components/CardOverlay/CardOverlay'
import { getActiveStop } from './Rescue.utils'
import { Error, Loading } from 'components'
import { RescueHeader, RescueStops } from './Rescue.children'

const RescueContext = createContext({})
export const useRescueContext = () => useContext(RescueContext)

export function Rescue() {
  const { rescue_id } = useParams()
  const { data: rescue, loading, error } = useApi(`/rescues/${rescue_id}`)
  const [expandedStop, setexpandedStop] = useState(null)
  const [openStop, setopenStop] = useState(null)
  const activeStop = useMemo(() => getActiveStop(rescue), [rescue])

  if (loading) return <Loading text="Loading Rescue" />
  if (error) return <Error message={error} />
  if (!rescue) return <Error message="No Rescue Found" />

  return (
    <Page
      id="Rescue"
      title={`${rescue.status} Rescue`}
      breadcrumbs={[
        { label: 'Rescues', link: '/chakra/rescues' },
        { label: rescue_id, link: `/chakra/rescues/${rescue_id}` },
      ]}
    >
      <RescueContext.Provider
        value={{
          expandedStop,
          setexpandedStop,
          setopenStop,
          activeStop,
          rescue,
        }}
      >
        <Flex direction="column" w="100%">
          <RescueHeader />
          <RescueStops />
        </Flex>
        <CardOverlay isOpen={openStop} onClose={() => setopenStop(null)} />
      </RescueContext.Provider>
    </Page>
  )
}
