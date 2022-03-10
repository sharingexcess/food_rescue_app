import { Button, Spacer, Text, Image } from '@sharingexcess/designsystem'
import { useIsMobile } from 'hooks'

export function ProductDemo() {
  const isMobile = useIsMobile()
  return (
    <>
      <main id="ProductDemo">
        <section id="Demo-background">
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
        </section>
        <div id="Demo-content">
          <Text type="primary-header" color="black" align="center">
            Improving access to excess
          </Text>
          <Spacer height={20} />
          <Text type="subheader" color="darkgrey" align="center">
            We work with organizations nationwide to help them deliver food to
            their comunities.
          </Text>
          <Spacer height={50} />
          <Button type="tertiary" color="black" size="medium">
            Schedule Rescue
          </Button>
          <Spacer height={20} />
          <Button type="tertiary" color="black" size="medium">
            Analytics
          </Button>
          <Spacer height={20} />
          <Button type="tertiary" color="black" size="medium">
            Your stats
          </Button>
          <Spacer height={30} />
          <div id="Demo-screen">
            <Image src="/LandingImage/demo_screen.png" alt="Demo Screen" />
          </div>
        </div>
      </main>
    </>
  )
}
