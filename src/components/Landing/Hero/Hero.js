import {
  Button,
  Spacer,
  Text,
  Image,
  FlexContainer,
} from '@sharingexcess/designsystem'
import { useAuth, useIsMobile } from 'hooks'

export function Hero() {
  const isMobile = useIsMobile()
  const { handleLogin } = useAuth()

  const BACKGROUND_IMAGE = isMobile
    ? '/LandingImage/hero_background_mobile.png'
    : '/LandingImage/hero_background.png'

  return (
    <FlexContainer direction="vertical" id="Hero">
      <Image
        id="Hero-background"
        src={BACKGROUND_IMAGE}
        alt="Hero Background"
      />

      <Text type="primary-header" color="black" align="center">
        Using <span className="darkgreen">surplus</span>
        <Spacer height={4} />
        as a solution to <span className="darkgreen">scarcity</span>
      </Text>
      <Spacer height={32} />
      <Text
        type="subheader"
        id="Hero-subheader"
        color="white"
        align="center"
        shadow
      >
        Rescuing surplus food from restaurants, grocery stores, and retailers
        since 2018.
      </Text>
      <Spacer height={32} />
      <Button size="large" handler={handleLogin}>
        Start saving food
      </Button>
    </FlexContainer>
  )
}
