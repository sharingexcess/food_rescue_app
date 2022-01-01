import React from 'react'
import { Ellipsis } from 'components'
import { Spacer, Text } from '@sharingexcess/designsystem'

export function Loading({ text = 'Loading', relative = false }) {
  return (
    <div id="Loading" className={relative ? 'relative' : ''}>
      <div id="Loading-icon">⚙️</div>
      <Spacer height={24} />
      <Text type="small-header" color="white" shadow align="center">
        {text}
        <Ellipsis />
      </Text>
    </div>
  )
}
