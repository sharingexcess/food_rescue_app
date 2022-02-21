import { Button } from '@sharingexcess/designsystem'
import React, { useState, useEffect } from 'react'

export function ReorderStops({ onMove, id, position, lengthOfStops }) {
  const UP = -1
  const DOWN = 1
  const [isDisabledUpButton, setDisabledUpButton] = useState(false)
  const [isDisabledDownButton, setDisabledDownButton] = useState(false)

  useEffect(() => {
    if (position(id) === 0) {
      setDisabledUpButton(true)
    }
    if (lengthOfStops - 1 === position(id)) {
      setDisabledDownButton(true)
    }
  }, [id, position, lengthOfStops])

  return (
    <div id="ReorderStops">
      <Button
        color="blue"
        size="small"
        id="ReorderStops-up-button"
        disabled={isDisabledUpButton}
        handler={() => onMove(id, UP)}
      >
        ⬆️ Move Up
      </Button>
      <Button
        color="blue"
        size="small"
        disabled={isDisabledDownButton}
        handler={() => onMove(id, DOWN)}
      >
        ⬇️ Move Down
      </Button>
    </div>
  )
}
