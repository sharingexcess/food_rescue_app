import { useWidth } from './useWidth'
import { useEffect, useState } from 'react'
import { MOBILE_THRESHOLD } from '../helpers/constants'

export function useIsMobile() {
  const width = useWidth()
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_THRESHOLD)

  useEffect(() => {
    if (!isMobile && width && width < 600) {
      setIsMobile(true)
    }
    if (isMobile && width && width > 600) {
      setIsMobile(false)
    }
  }, [width, isMobile])

  return isMobile
}
