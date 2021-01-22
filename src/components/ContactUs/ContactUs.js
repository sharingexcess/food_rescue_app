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
        ></iframe>
      </main>
    </>
  )
}

export default ContactUs
