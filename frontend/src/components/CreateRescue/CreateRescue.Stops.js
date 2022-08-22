import { Reorder } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Stop } from './CreateRescue.Stop'

export function Stops({ stops, setStops, removeStop }) {
  // Because the Drag and Drop component can only handle string items,
  // stringify each stop here, then parse as we pass to the component
  const [stringStops, setStringStops] = useState(
    stops.map(stop => JSON.stringify(stop))
  )
  useEffect(() => {
    setStringStops(stops.map(stop => JSON.stringify(stop)))
  }, [stops])

  // keep track of when drag events finish to update parent state
  const [shouldReorder, setShouldReorder] = useState(false)
  useEffect(() => {
    if (shouldReorder && stringStops) {
      // if we have reordered stops, update the parent state
      setStops(stringStops.map(stop => JSON.parse(stop)))
      setShouldReorder(false)
    }
  }, [shouldReorder, stringStops])

  function handlePointerUp() {
    // when a drag event stops, allow animations to finish smoothly
    // then trigger an update of the parent state
    setTimeout(() => {
      setShouldReorder(true)
    }, 800)
  }

  return (
    <Reorder.Group
      as="section"
      axis="y"
      values={stringStops}
      onReorder={setStringStops}
    >
      {stringStops.map((stringStop, i) => (
        <Reorder.Item
          as="div"
          key={stringStop}
          value={stringStop}
          onPointerUp={handlePointerUp}
        >
          <Stop
            stop={JSON.parse(stringStop)}
            removeStop={() => removeStop(i)}
          />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}
