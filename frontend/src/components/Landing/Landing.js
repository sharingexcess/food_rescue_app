import { Button, Spacer, Text } from '@sharingexcess/designsystem'
import Map from 'assets/map.png'

export function Landing({ handleLogin }) {
  return (
    <main id="Landing">
      <Hero />
      <ProductDemo />
      <Testimonial />
    </main>
  )
}
