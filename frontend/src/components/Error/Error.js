import {
  Button,
  FlexContainer,
  Spacer,
  Text,
} from '@sharingexcess/designsystem'
import React from 'react'

export function Error({ crash, message = '' }) {
  const messageText =
    'Looks like there was an error on this page...\n' +
    (typeof message === 'string'
      ? message
      : message.toString
      ? message.toString()
      : JSON.stringify(message))

  return (
    <main id="Error">
      <Text type="primary-header" color="white" shadow>
        Uh oh!
      </Text>
      <Text type="paragraph" color="white" shadow align="center">
        {crash
          ? 'Uh oh... looks like something broke on this page.'
          : messageText ||
            "The page you're looking for may have moved, or doesn't exist."}
      </Text>
      <Spacer height={32} />
      <FlexContainer direction="vertical">
        <a href={window.location.href}>
          <Button>Reload Current Page</Button>
        </a>
        <Spacer height={16} />
        <a href="/">
          <Button>Back to Home Page</Button>
        </a>
      </FlexContainer>
    </main>
  )
}
