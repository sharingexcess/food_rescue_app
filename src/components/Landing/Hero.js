import { Button, Spacer, Text, Image } from '@sharingexcess/designsystem'
import { useAuth } from 'hooks'

export function Hero() {
  const { handleLogin } = useAuth()
  return (
    <>
      <main id="Hero">
        <section id="Hero-background">
          <Image
            src="/LandingImage/hero_background.png"
            alt="Hero Background"
          />
        </section>
        <div id="Hero-content">
          <Text type="primary-header" color="black" align="center">
            Using
            <span className="darkgreen">
              {' '}
              surplus <br></br>
            </span>
            as a solution to
            <span className="darkgreen"> scarcity</span>
          </Text>
          <Spacer height={30} />
          <Text type="subheader" color="darkgrey" align="center">
            Rescuing surplus food from restaurants, grocery stores, and
            retailers since 2018.
          </Text>
          <Spacer height={30} />
          <Button size="medium" handler={handleLogin}>
            Start saving food
          </Button>
        </div>
      </main>
    </>
  )
}
