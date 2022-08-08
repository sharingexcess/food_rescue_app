import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
} from '@chakra-ui/react'
import { CardOverlay } from 'chakra_components/CardOverlay/CardOverlay'
import { PickupFooter, PickupHeader } from 'chakra_components/Pickup/Pickup'
import { useRescueContext } from 'chakra_components/Rescue/Rescue'
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
        // CardBody={PickupBody}
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
