import { Box, Heading } from '@chakra-ui/react'
import { Reorder } from 'framer-motion'
import { STATUSES } from 'helpers'
import { useEffect, useState } from 'react'
import { Stop } from './EditRescue.Stop'

export function Stops({ stops, setStops, removeStop }) {
  // Because the Drag and Drop component can only handle string items,
  // stringify each stop here, then parse as we pass to the component

  const cancelledStops =
    stops?.filter(i => i.status === STATUSES.CANCELLED) || []
  const completedStops =
    stops?.filter(i => i.status === STATUSES.COMPLETED) || []
  const [remainingStringStops, setRemainingStringStops] = useState(
    stops
      ?.filter(i => [STATUSES.ACTIVE, STATUSES.SCHEDULED].includes(i.status))
      .map(stop => JSON.stringify(stop)) || []
  )
  useEffect(() => {
    setRemainingStringStops(
      stops
        ?.filter(i => [STATUSES.ACTIVE, STATUSES.SCHEDULED].includes(i.status))
        .map(stop => JSON.stringify(stop)) || []
    )
  }, [stops])

  // keep track of when drag events finish to update parent state
  const [shouldReorder, setShouldReorder] = useState(false)
  useEffect(() => {
    if (shouldReorder && remainingStringStops) {
      // if we have reordered stops, update the parent state
      setStops([
        ...cancelledStops,
        ...completedStops,
        ...remainingStringStops.map(stop => JSON.parse(stop)),
      ])
      setShouldReorder(false)
    }
  }, [shouldReorder, remainingStringStops])

  function handlePointerUp() {
    // when a drag event stops, allow animations to finish smoothly
    // then trigger an update of the parent state
    setTimeout(() => {
      setShouldReorder(true)
    }, 800)
  }

  return (
    <>
      {cancelledStops.length ? (
        <Heading
          as="h4"
          size="sm"
          mt="12"
          fontWeight="600"
          letterSpacing="1"
          fontSize="sm"
          color="element.secondary"
          textTransform="uppercase"
        >
          ❌&nbsp;&nbsp;Cancelled Stops
        </Heading>
      ) : null}
      {cancelledStops.map((stop, i) => (
        <Stop key={i} stop={stop} removeStop={() => removeStop(i)} />
      ))}
      {completedStops.length ? (
        <Heading
          as="h4"
          size="sm"
          mt="12"
          fontWeight="600"
          letterSpacing="1"
          fontSize="sm"
          color="element.secondary"
          textTransform="uppercase"
        >
          ✅&nbsp;&nbsp;Completed Stops
        </Heading>
      ) : null}
      {completedStops.map((stop, i) => (
        <Stop key={i} stop={stop} removeStop={() => removeStop(i)} />
      ))}
      {remainingStringStops.length ? (
        <Heading
          as="h4"
          size="sm"
          mt="12"
          fontWeight="600"
          letterSpacing="1"
          fontSize="sm"
          color="element.secondary"
          textTransform="uppercase"
        >
          ⏩&nbsp;&nbsp;Remaining Stops
        </Heading>
      ) : null}
      <Reorder.Group
        as="section"
        axis="y"
        values={remainingStringStops}
        onReorder={setRemainingStringStops}
      >
        {remainingStringStops.map((stringStop, i) => (
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
      <Box h="2" />
    </>
  )
}
