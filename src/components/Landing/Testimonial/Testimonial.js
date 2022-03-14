import { Text, Image } from '@sharingexcess/designsystem'
import { TESTIMONIALS } from '../content'
import { useIsMobile } from 'hooks'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Navigation, Pagination } from 'swiper'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

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
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={isMobile ? 1 : 2}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2,
              slideShadows: true,
            }}
            pagination={true}
            navigation={isMobile ? true : false}
            modules={[EffectCoverflow, Pagination, Navigation]}
            className="mySwiper"
          >
            {TESTIMONIALS.map(user => (
              <SwiperSlide key={user.name} className="Slide">
                <div className="Slide-content">
                  <div className="Quotemark-vector">
                    <Image src={user.quotemark} />
                  </div>
                  <Text type="paragraph" color="greydark" align="left">
                    {user.quote}
                  </Text>
                  <div className="Testimonial-author">
                    <Image src={user.image} alt={user.name} />
                    <Text type="subheader" color={user.color} align="right">
                      {user.name}
                    </Text>
                    <Text type="small" color="black" align="right">
                      {user.title}
                    </Text>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  )
}
