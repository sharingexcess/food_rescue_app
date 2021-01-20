import { GoBack } from '../../helpers/components'
import './ContactUs.scss'

function ContactUs() {
  return (
    <>
      <main id="ContactUs">
        <GoBack />
        <h1>Contact Us!</h1>
        <iframe
          title="Contact Form"
          src="https://docs.google.com/forms/d/e/1FAIpQLSfQoDwIktXHiklsfz7bdKQTNlwgi-oH6ydA-MaLtLFtMpvg2g/viewform?embedded=true"
          width="100%"
          height="1200px"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
        ></iframe>
      </main>
    </>
  )
}

export default ContactUs
