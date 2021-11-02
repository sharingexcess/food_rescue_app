import { ExternalLink, Spacer, Text } from '@sharingexcess/designsystem'

export function ContactUs() {
  return (
    <main id="ContactUs">
      <Spacer height={32} />
      <Text type="paragraph" color="white" shadow>
        Need help? Call us at{' '}
        <ExternalLink to="tel:1-833-742-7397">1 (833) 742-7397</ExternalLink>
        <br />
        Use the form below to submit any feedback to improve the app.
      </Text>
      <Spacer height={32} />
      <iframe
        title="Contact Form"
        src="https://docs.google.com/forms/d/e/1FAIpQLSfQoDwIktXHiklsfz7bdKQTNlwgi-oH6ydA-MaLtLFtMpvg2g/viewform?embedded=true"
      ></iframe>
    </main>
  )
}
