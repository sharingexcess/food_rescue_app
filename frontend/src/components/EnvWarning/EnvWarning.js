import { Text } from '@sharingexcess/designsystem'
import { IS_DEV_ENVIRONMENT } from 'helpers'
import React, { useState } from 'react'
import './EnvWarning.scss'

export function EnvWarning() {
  const [expanded, setExpanded] = useState(false)

  if (IS_DEV_ENVIRONMENT && window.location.hostname !== 'localhost') {
    return (
      <div
        id="EnvWarning"
        className={expanded ? 'expanded' : null}
        onClick={() => setExpanded(!expanded)}
      >
        <Text type="section-header" color="white" shadow>
          !
        </Text>
        <Text type="small" color="white" shadow align="center">
          You are currently in the development environment. This is not real
          data!
        </Text>
      </div>
    )
  } else if (!IS_DEV_ENVIRONMENT && window.location.hostname === 'localhost') {
    return (
      <div
        id="EnvWarning"
        className={expanded ? 'expanded' : null}
        onClick={() => setExpanded(!expanded)}
      >
        <Text type="section-header" color="white" shadow>
          !
        </Text>
        <Text type="small" color="white" shadow align="center">
          You are currently in the production environment. This is real data!
        </Text>
      </div>
    )
  }
  return null
}
