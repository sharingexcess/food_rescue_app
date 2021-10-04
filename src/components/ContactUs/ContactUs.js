import { ExternalLink } from '@sharingexcess/designsystem'

export function ContactUs() {
  return (
    <main id="ContactUs">
      <p>
        Need help? Call us at{' '}
        <ExternalLink to="tel:1-833-7424-7397">1 (833) 7424-7397</ExternalLink>
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
