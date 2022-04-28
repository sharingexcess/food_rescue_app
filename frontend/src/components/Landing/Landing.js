import { Hero } from './Hero/Hero'
import { ProductDemo } from './ProductDemo/ProductDemo'
import { Testimonial } from './Testimonial/Testimonial'

export function Landing({ handleLogin }) {
  return (
    <main id="Landing">
      <Hero handleLogin={handleLogin} />
      <ProductDemo />
      <Testimonial />
    </main>
  )
}
