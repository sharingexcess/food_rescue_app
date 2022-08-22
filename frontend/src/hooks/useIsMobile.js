import { useEffect, useState } from 'react'
import { MOBILE_THRESHOLD } from '../helpers/constants'

let debounce_timer

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_THRESHOLD)

  useEffect(() => {
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  })

  function updateWidth() {
    if (debounce_timer) {
      clearTimeout(debounce_timer)
    }
    setTimeout(() => {
      if (!isMobile && window.innerWidth < MOBILE_THRESHOLD) {
        setIsMobile(true)
      }
      if (isMobile && window.innerWidth > MOBILE_THRESHOLD) {
        setIsMobile(false)
      }
    }, 200)
  }

  return isMobile
}
