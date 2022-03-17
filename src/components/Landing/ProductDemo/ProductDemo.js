import {
  Button,
  Spacer,
  Text,
  Image,
  FlexContainer,
} from '@sharingexcess/designsystem'
import { useIsMobile } from 'hooks'
import { useState } from 'react'
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
          Improving access to excess
        </Text>
        <Spacer height={16} />
        <Text type="subheader" color="black" align="center">
          We work with organizations nationwide to help them deliver food to
          their comunities.
        </Text>
        <Spacer height={48} />

        <FlexContainer
          direction="horizontal"
          id="ProductDemo-content-container"
        >
          <div className="ProductDemo-content-menu">
            {Object.keys(DEMO_VIDEOS).map((value, index) => (
              <>
                <Button
                  type="secondary"
                  color="black"
                  size="medium"
                  fullWidth
                  handler={() => setDemo(Object.keys(DEMO_VIDEOS)[index])}
                >
                  {Object.keys(DEMO_VIDEOS)[index]}
                </Button>
                <Spacer height={25} />
              </>
            ))}
          </div>

          <Spacer height={40} />

          <div className="ProductDemo-screen">
            {Object.keys(DEMO_VIDEOS).map(i =>
              isMobile ? (
                <img
                  className={demo === i ? 'visible' : 'invisible'}
                  src={DEMO_VIDEOS[i].gif}
                  alt="Product Demo"
                />
              ) : (
                <video
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
