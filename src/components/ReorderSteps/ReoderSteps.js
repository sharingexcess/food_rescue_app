import React from 'react'

export function ReorderSteps({onMove, id}) {
  return (
    <div className="reorder-button-container">
    <button className="reorder-button" onClick={() => onMove(id, -1)}>
      <i className="fas fa-chevron-up" />
    </button>
    <button className="reorder-button" onClick={() => onMove(id, 1)}>
      <i className="fas fa-chevron-down" />
    </button>
  </div>
  )
}
