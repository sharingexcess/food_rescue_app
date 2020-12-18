import React, { useState, useEffect } from 'react'

export default function Ellipsis({ style }) {
  const [text, setText] = useState('.')

  useEffect(() => {
    const int = window.setInterval(() => {
      setText(text.length === 3 ? '.' : text + '.')
    }, 400)
    return () => window.clearInterval(int)
  }, [text])

  return (
    <div
      style={{
        display: 'inline-block',
        width: '1.1rem',
        textAlign: 'left',
        ...style,
      }}
    >
      {text}
    </div>
  )
}
