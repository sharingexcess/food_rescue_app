import { Button, ExternalLink, Spacer, Text } from '@sharingexcess/designsystem'
import { IS_DEV_ENVIRONMENT } from 'helpers'
import React from 'react'

function SwitchToDev() {
  return (
    <main id="SwitchEnv">
      <div className="icon">🚛</div>
      <Text type="section-header" color="white" align="center" shadow>
        You're currently in the production environment.
      </Text>
      <Spacer height={8} />

      <Text type="subheader" color="white" align="center" shadow>
        Production is used for REAL DATA - don't use this for testing or
        experimentation, because it enters our impact reporting database!
      </Text>
      <Spacer height={32} />
      <ExternalLink to="https://sharingexcess.web.app">
        <Button type="primary" color="white">
          Open Development/Testing App
        </Button>
      </ExternalLink>
    </main>
  )
}

function SwitchToProd() {
  return (
    <main id="SwitchEnv">
      <div className="icon">⚙️</div>
      <Text type="section-header" color="white" align="center" shadow>
        You're currently in the development environment.
      </Text>
      <Spacer height={8} />

      <Text type="subheader" color="white" align="center" shadow>
        Development is used for building new features, testing, and staging
        purposes, and does not effect our impact reporting databases.
      </Text>
      <Spacer height={32} />
      <ExternalLink to="https://sharingexcess.web.app">
        <Button type="primary" color="white">
          Open Production App
        </Button>
      </ExternalLink>
    </main>
  )
}

export function SwitchEnv() {
  return IS_DEV_ENVIRONMENT ? <SwitchToProd /> : <SwitchToDev />
}
