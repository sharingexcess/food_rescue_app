import React, { useState, useEffect } from 'react'

export function ReorderSteps({ onMove, id, position, lengthOfStops }) {
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
    <div className="reorder-button-container">
      <button
        disabled={isDisabledUpButton}
        className={`${
          isDisabledUpButton ? 'disabled-button' : 'reorder-button'
        }`}
        onClick={() => onMove(id, UP)}
      >
        <i className="fas fa-chevron-up" />
      </button>
      <button
        disabled={isDisabledDownButton}
        className={`${
          isDisabledDownButton ? 'disabled-button' : 'reorder-button'
        }`}
        onClick={() => onMove(id, DOWN)}
      >
        <i className="fas fa-chevron-down" />
      </button>
    </div>
  )
}
