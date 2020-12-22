import React from 'react'
import './Spacer.scss'

export default function Spacer({ direction = 'vertical' }) {
  return (
    <div className={`Spacer ${direction}`}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}
