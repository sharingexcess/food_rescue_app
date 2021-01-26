import { ExternalLink } from '../../helpers/components'
import Header from '../Header/Header'
import './ContactUs.scss'

function ContactUs() {
  return (
    <main id="ContactUs">
      <Header text="Help + Feedback" />
      <p>
        Need help? Call us at{' '}
        <ExternalLink url="tel:1-833-7424-7397">1 (833) 7424-7397</ExternalLink>
        <br />
        Use the form below to submit any feedback to improve the app.
      </p>
      <iframe
        title="Contact Form"
        src="https://docs.google.com/forms/d/e/1FAIpQLSfQoDwIktXHiklsfz7bdKQTNlwgi-oH6ydA-MaLtLFtMpvg2g/viewform?embedded=true"
      ></iframe>
    </main>
  )
}

export default ContactUs
