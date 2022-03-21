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

      <Text
        type="primary-header"
        id="Hero-header"
        color="white"
        align="center"
        shadow
      >
        Using <span className="green">surplus</span>
        <Spacer height={4} />
        as a solution to <span className="green">scarcity</span>.
      </Text>
      <Spacer height={32} />
      <Text
        type="subheader"
        id="Hero-subheader"
        color="white"
        shadow
        align="center"
      >
        <strong>Sharing Excess</strong> rescues food from wholesalers, grocery
        stores, and restaurants to help fight food scarcity in our community.
      </Text>
      <Spacer height={32} />
      <Button size="large" handler={handleLogin}>
        Start Saving Food
      </Button>
    </FlexContainer>
  )
}
