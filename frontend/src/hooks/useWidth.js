import { useState, useEffect } from 'react'

export function useWidth() {
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  })

  function updateWidth() {
    setWidth(window.innerWidth)
  }

  return width
}
