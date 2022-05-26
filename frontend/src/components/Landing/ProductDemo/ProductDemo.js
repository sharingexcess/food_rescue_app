import {
  Button,
  Spacer,
  Text,
  Image,
  FlexContainer,
} from '@sharingexcess/designsystem'
import { useIsMobile } from 'hooks'
import { useState, Fragment } from 'react'
import { DEMO_VIDEOS } from '../content'

export function ProductDemo() {
  const isMobile = useIsMobile()
  const [demo, setDemo] = useState('Track Your Progress')

  const BACKGROUND_IMAGE = isMobile
    ? '/LandingImage/demo_background_mobile.png'
    : '/LandingImage/demo_background.png'

  return (
    <FlexContainer direction="vertical" id="ProductDemo">
      <Image
        id="ProductDemo-background"
        src={BACKGROUND_IMAGE}
        alt="Hero Background"
      />
      <div id="ProductDemo-content">
        <Text type="primary-header" color="black" align="center" shadow>
          We improve access to excess.
        </Text>
        <Spacer height={16} />
        <Text type="subheader" color="black" align="center">
          At Sharing Excess, we're building technology that makes it easier for
          volunteers and businesses work together to fight food scarcity.
        </Text>
        <Spacer height={48} />

        <FlexContainer
          direction="horizontal"
          id="ProductDemo-content-container"
        >
          <div className="ProductDemo-content-menu">
            {Object.keys(DEMO_VIDEOS).map((value, index) => (
              <Fragment key={index}>
                <Button
                  type="secondary"
                  color="black"
                  size="medium"
                  fullWidth
                  handler={() => setDemo(Object.keys(DEMO_VIDEOS)[index])}
                >
                  {Object.keys(DEMO_VIDEOS)[index]}
                </Button>
                <Spacer height={16} />
              </Fragment>
            ))}
          </div>

          <Spacer height={40} />

          <div className="ProductDemo-screen">
            {Object.keys(DEMO_VIDEOS).map(i =>
              isMobile ? (
                <img
                  key={i}
                  className={demo === i ? 'visible' : 'invisible'}
                  src={DEMO_VIDEOS[i].gif}
                  alt="Product Demo"
                />
              ) : (
                <video
                  key={i}
                  className={demo === i ? 'visible' : 'invisible'}
                  src={DEMO_VIDEOS[i].mp4}
                  autoPlay
                  playsInline
                  preload="auto"
                  muted
                  loop
                />
              )
            )}
          </div>
        </FlexContainer>
      </div>
    </FlexContainer>
  )
}
