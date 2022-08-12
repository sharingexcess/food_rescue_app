import React, { useEffect, useState } from 'react'

export const Ellipsis = ({ style }) => {
  const [text, setText] = useState('.')

  useEffect(() => {
    const int = window.setInterval(() => {
      setText(text.length === 3 ? '.' : text + '.')
    }, 600)
    return () => window.clearInterval(int)
  }, [text])

  return (
    <span
      style={{
        display: 'inline-flex',
        width: '1.1rem',
        textAlign: 'left',
        ...style,
      }}
    >
      {text}
    </span>
  )
}
