import { useEffect, useState } from 'react'

export function useScroll() {
  const [scroll, setScroll] = useState(window.pageYOffset)

  useEffect(() => {
    window.addEventListener('scroll', updateScroll)
    return () => window.removeEventListener('scroll', updateScroll)
  }, []) // eslint-disable-line

  function updateScroll() {
    if (window.pageYOffset !== scroll) {
      setScroll(window.pageYOffset)
    }
  }

  return scroll
}
