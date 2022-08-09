import { useState, useEffect } from 'react'

let debounce_timer

export function useWidth() {
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  })

  function updateWidth() {
    if (debounce_timer) {
      clearTimeout(debounce_timer)
    }
    setTimeout(() => {
      setWidth(window.innerWidth)
    }, 500)
  }

  return width
}
