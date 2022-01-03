import React, { useEffect } from 'react'
import { PoundsInDateRange } from 'components'
import { useFirestore } from 'hooks'

export function Analytics() {
  const { loadAllData } = useFirestore()

  useEffect(() => loadAllData(), []) // eslint-disable-line

  return (
    <main id="Analytics">
      <PoundsInDateRange />
    </main>
  )
}
