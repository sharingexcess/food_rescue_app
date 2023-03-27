import { Reorder } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Transfer } from './ScheduleRescue.Transfer'

export function Transfers({ transfers, setTransfers, removeTransfer }) {
  // Because the Drag and Drop component can only handle string items,
  // stringify each transfer here, then parse as we pass to the component
  const [stringTransfers, setStringTransfers] = useState(
    transfers.map(transfer => JSON.stringify(transfer))
  )
  useEffect(() => {
    setStringTransfers(transfers.map(transfer => JSON.stringify(transfer)))
  }, [transfers])

  // keep track of when drag events finish to update parent state
  const [shouldReorder, setShouldReorder] = useState(false)
  useEffect(() => {
    if (shouldReorder && stringTransfers) {
      // if we have reordered transfers, update the parent state
      setTransfers(stringTransfers.map(transfer => JSON.parse(transfer)))
      setShouldReorder(false)
    }
  }, [shouldReorder, stringTransfers])

  function handlePointerUp() {
    // when a drag event transfers, allow animations to finish smoothly
    // then trigger an update of the parent state
    setTimeout(() => {
      setShouldReorder(true)
    }, 800)
  }

  return (
    <Reorder.Group
      as="section"
      axis="y"
      values={stringTransfers}
      onReorder={setStringTransfers}
    >
      {stringTransfers.map((stringTransfer, i) => (
        <Reorder.Item
          as="div"
          key={stringTransfer}
          value={stringTransfer}
          onPointerUp={handlePointerUp}
        >
          <Transfer
            transfer={JSON.parse(stringTransfer)}
            removeTransfer={() => removeTransfer(i)}
          />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}
