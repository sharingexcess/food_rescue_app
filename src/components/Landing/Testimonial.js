import { Button, Spacer, Text, Image, Card } from '@sharingexcess/designsystem'
import { dataSlider } from './dataSlider'
import { useState } from 'react/cjs/react.development'
import leftArrow from 'assets/leftArrow.svg'
import rightArrow from 'assets/rightArrow.svg'
import { useIsMobile } from 'hooks'

function ButtonSlider({ direction, moveSlide }) {
  console.log(moveSlide)
  return (
    <button
      onClick={moveSlide}
      className={
        direction === 'next' ? 'button-slide next' : 'button-slide prev'
      }
    >
      <Image src={direction === 'next' ? rightArrow : leftArrow} />
    </button>
  )
}
function TestimonialSlider() {
  const [slideIndex, setSlideIndex] = useState(1)

  const nextSlide = () => {
    if (slideIndex !== dataSlider.length) {
      setSlideIndex(slideIndex + 1)
    } else if (slideIndex === dataSlider.length) {
      setSlideIndex(1)
    }
  }

  const prevSlide = () => {
    if (slideIndex !== 1) {
      setSlideIndex(slideIndex - 1)
    } else if (slideIndex === 1) {
      setSlideIndex(dataSlider.length)
    }
  }

  return (
    <div className="Testimonial-slider">
      {dataSlider.map((author, index) => {
        return (
          <div
            key={author.name}
            className={slideIndex === index + 1 ? 'Slide active' : 'Slide'}
          >
            <div className="Quotemark-vector">
              <Image src={author.quotemark} />
            </div>
            <Text type="paragraph" color="greydark" align="left">
              {author.quote}
            </Text>
            <div className="Testimonial-author">
              <Image src={author.image} alt={author.name} />
              <Text type="subheader" color={author.color} align="right">
                {author.name}
              </Text>
              <Text type="small" color="black" align="right">
                {author.title}
              </Text>
            </div>
          </div>
        )
      })}
      <ButtonSlider moveSlide={prevSlide} direction={'prev'} />
      <ButtonSlider moveSlide={nextSlide} direction={'next'} />
    </div>
  )
}

export function Testimonial() {
  const isMobile = useIsMobile()
  return (
    <>
      <div id="Testimonial">
        <div id="Testimonial-background">
          {isMobile ? (
            <Image
              src="/LandingImage/test_background_mobile.png"
              alt="Testimonial Background"
            />
          ) : (
            <Image
              src="/LandingImage/test_background.png"
              alt="Testimonial Background"
            />
          )}
        </div>
        <div id="Testimonial-content">
          <TestimonialSlider />
        </div>
      </div>
    </>
  )
}
