import { Button, Spacer, Text } from '@sharingexcess/designsystem'
import React from 'react'

export function Error({ crash, message }) {
  return (
    <main id="Error">
      <Text type="primary-header" color="white" shadow>
        Uh oh!
      </Text>
      <Text type="paragraph" color="white" shadow align="center">
        {crash
          ? 'Uh oh... looks like something broke on this page.'
          : message ||
            "The page you're looking for may have moved, or doesn't exist."}
      </Text>
      <Spacer height={32} />
      <a href="/">
        <Button>Back to Home Page</Button>
      </a>
    </main>
  )
}
