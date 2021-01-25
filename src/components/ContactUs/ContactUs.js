import Header from '../Header/Header'
import './ContactUs.scss'

function ContactUs() {
  return (
    <main id="ContactUs">
      <Header text="Help + Feedback" />
      <iframe
        title="Contact Form"
        src="https://docs.google.com/forms/d/e/1FAIpQLSfQoDwIktXHiklsfz7bdKQTNlwgi-oH6ydA-MaLtLFtMpvg2g/viewform?embedded=true"
      ></iframe>
    </main>
  )
}

export default ContactUs
