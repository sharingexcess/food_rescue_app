import { Button, Spacer, Text, Image } from '@sharingexcess/designsystem'
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
    <div id="ProductDemo">
      <Image
        id="ProductDemo-background"
        src={BACKGROUND_IMAGE}
        alt="Hero Background"
      />
      <div id="ProductDemo-content">
        <Text type="primary-header" color="black" align="center">
          Improving access to excess
        </Text>
        <Spacer height={16} />
        <Text type="subheader" color="black" align="center">
          We work with organizations nationwide to help them deliver food to
          their comunities.
        </Text>
        <Spacer height={48} />

        <div className="ProductDemo-content-container">
          <div className="ProductDemo-content-menu">
            <Button
              type="secondary"
              color="black"
              size="medium"
              fullWidth
              handler={() => setDemo('Coordinate Rescues')}
            >
              Coordinate Rescues
            </Button>
            <Spacer height={20} />
            <Button
              type="secondary"
              color="black"
              size="medium"
              fullWidth
              handler={() => setDemo('Measure Impact')}
            >
              Measure Impact
            </Button>
            <Spacer height={20} />
            <Button
              type="secondary"
              color="black"
              size="medium"
              fullWidth
              handler={() => setDemo('Track Your Progress')}
            >
              Track Your Progress
            </Button>
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
        </div>
      </div>
    </div>
  )
}
