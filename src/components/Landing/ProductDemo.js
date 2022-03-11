import { Button, Spacer, Text, Image, Card } from '@sharingexcess/designsystem'
import { useIsMobile } from 'hooks'
import { useState } from 'react/cjs/react.development'

export function ProductDemo() {
  const isMobile = useIsMobile()
  const [demo, setDemo] = useState('')

  return (
    <>
      <main id="ProductDemo">
        <div id="Demo-background">
          {isMobile ? (
            <Image
              src="/LandingImage/demo_background_mobile.png"
              alt="Demo Background"
            />
          ) : (
            <Image
              src="/LandingImage/demo_background.png"
              alt="Demo Background"
            />
          )}
        </div>
        <div id="Demo-content">
          <Text type="primary-header" color="black" align="center">
            Improving access to excess
          </Text>
          <Spacer height={30} />
          <Text type="subheader" color="darkgrey" align="center">
            We work with organizations nationwide to help them deliver food to
            their comunities.
          </Text>
          <Spacer height={50} />
          <div className="Demo-content-container">
            <div className="Demo-content-menu">
              <Button
                type="secondary"
                color="black"
                size="medium"
                fullWidth
                handler={() => setDemo('/LandingImage/demo_scheduleRescue.mp4')}
              >
                Schedule Rescue
              </Button>
              <Spacer height={20} />
              <Button
                type="secondary"
                color="black"
                size="medium"
                fullWidth
                handler={() => setDemo('/LandingImage/demo_analytics.mp4')}
              >
                Analytics
              </Button>
              <Spacer height={20} />
              <Button
                type="secondary"
                color="black"
                size="medium"
                fullWidth
                handler={() => setDemo('/LandingImage/demo_myStats.mp4')}
              >
                Your stats
              </Button>
            </div>
            <div className="Demo-screen">
              {demo === '' ? (
                <video
                  id="demoVideo"
                  src="/LandingImage/demo_myStats.mp4"
                  autoPlay
                  playsInline
                  preload="auto"
                  muted
                  loop
                />
              ) : (
                <video
                  id="demoVideo"
                  src={demo}
                  autoPlay
                  playsInline
                  preload="auto"
                  muted
                  loop
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
