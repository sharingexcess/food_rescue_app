import { Text, Image, FlexContainer, Spacer } from '@sharingexcess/designsystem'
import { TESTIMONIALS, COLORS } from '../content'
import { useIsMobile } from 'hooks'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

export function Testimonial() {
  const isMobile = useIsMobile()
  const BACKGROUND_IMAGE = isMobile
    ? '/LandingImage/test_background_mobile.png'
    : '/LandingImage/test_background.png'
  return (
    <FlexContainer direction="vertical" id="Testimonial">
      <Image
        id="Testimonial-background"
        src={BACKGROUND_IMAGE}
        alt="Hero Background"
      />
      <Text type="primary-header" color="black" align="center">
        Testimonials
      </Text>
      <Text type="subheader" color="black" align="center">
        We work to build technology that matters for those doing the work on the
        ground. Hear from the people that matter most!
      </Text>
      <Spacer height={isMobile ? 32 : 50} />
      <FlexContainer id="Testimonial-content">
        <Swiper
          pagination={true}
          navigation={true}
          modules={[Pagination, Navigation]}
          className="Testimonial-swiper"
        >
          {TESTIMONIALS.map((user, index) => (
            <SwiperSlide className="Testimonial-content-slide" key={index}>
              <Image
                src={user.image}
                id="Testimonial-content-headshot"
                classList={[COLORS[index]]}
              />
              <Spacer height={20} />
              <Image
                src={isMobile ? '' : user.quotemark}
                id="Testimonial-content-vector"
              />
              <Text type="paragraph" color="greydark" align="left">
                {user.quote}
              </Text>
              <Spacer height={20} />
              <Text type="small-header" color={COLORS[index]} align="center">
                {user.name}
              </Text>
              <Text type="small" color="black" align="center">
                {user.title}
              </Text>
            </SwiperSlide>
          ))}
        </Swiper>
      </FlexContainer>
    </FlexContainer>
  )
}
