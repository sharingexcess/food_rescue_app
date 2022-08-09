import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
} from '@chakra-ui/react'
import {
  useRescueContext,
  PickupFooter,
  PickupHeader,
  CardOverlay,
} from 'chakra_components'
import { useApi } from 'hooks'
import { createContext, useContext, useEffect, useState } from 'react'

export function EditDelivery({ stop }) {
  const { setOpenStop, openStop } = useRescueContext()
  const delivery_id = openStop && openStop.id
  const [notes, setNotes] = useState('')
  const { data: delivery } = useApi(
    delivery_id ? `/stops/${delivery_id}` : null
  )
  return (
    <StopContext.Provider value={stopContextValue}>
      <CardOverlay
        isOpen={!!stop}
        handleClose={() => setOpenStop(null)}
        CardHeader={PickupHeader}
        CardBody={EditDeliveryBody}
        CardFooter={PickupFooter}
      />
    </StopContext.Provider>
  )
  function EditDeliveryBody() {
    return (
      <Slider aria-label="slider-ex-1" defaultValue={30}>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    )
  }
}
