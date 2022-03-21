import { Hero } from './Hero/Hero'
import { ProductDemo } from './ProductDemo/ProductDemo'
import { Testimonial } from './Testimonial/Testimonial'

export function Landing() {
  return (
    <main id="Landing">
      <Hero />
      <ProductDemo />
      <Testimonial />
    </main>
  )
}
