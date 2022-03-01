import { Button, Spacer, Text } from '@sharingexcess/designsystem'
import Map from 'assets/map.png'
import { useAuth } from 'hooks'

export function Landing() {
  const { handleLogin } = useAuth()
  return (
    <>
      <main id="Landing">
        <Spacer height={24} />
        <img src={Map} alt="Sharing Excess" />
        <Text type="primary-header" color="white" shadow align="center">
          Using food surplus to solve food scarcity.
        </Text>
        <Spacer height={4} />
        <Text type="subheader" color="white" shadow align="center">
          Partnering with over 170 nonprofits, we've delivered over 5,000,000
          lbs. of food since 2018.
        </Text>
        <Spacer height={16} />
        <Button size="large" fullWidth handler={handleLogin}>
          Login with Google
        </Button>
      </main>
    </>
  )
}
