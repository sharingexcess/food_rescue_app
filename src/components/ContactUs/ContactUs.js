import { useForm } from '@formspree/react'
import { ExternalLink, Spacer, Text } from '@sharingexcess/designsystem'
import { FORMSPREE_FORM_ID } from 'helpers'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'

export function ContactUs() {
  const { user } = useAuth()
  const [state, handleSubmit] = useForm(FORMSPREE_FORM_ID)
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    message: '',
  })

  useEffect(() => {
    if (state.succeeded) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        message: '',
      })
    }
  }, [state.succeeded, user])

  function handleChange(e) {
    setFormData(data => ({ ...data, [e.target.id]: e.target.value }))
  }

  function validateText(text) {
    if (typeof text === 'string') {
      return text.length ? 'valid' : 'invalid'
    } else return undefined
  }

  function isFormComplete() {
    return formData.name && formData.email && formData.message
  }

  return (
    <main id="ContactUs">
      <Text type="section-header" color="white" shadow>
        Reach out for help!
      </Text>
      <Spacer height={8} />
      <Text type="paragraph" color="white" shadow>
        For immediate support, call Hannah at&nbsp;
        <ExternalLink to="tel:1-833-742-7397">1 (833) 742-7397</ExternalLink>
        .&nbsp; Use the form below to submit any feedback to improve the app.
      </Text>
      <Spacer height={24} />
      <form onSubmit={handleSubmit}>
        <input type="hidden" value={user.name} name="name" />
        <input type="hidden" value={user.email} name="email" />
        <input type="hidden" value={user.phone} name="phone" />
        <textarea
          id="message"
          name="message"
          rows={3}
          value={formData.message}
          onChange={handleChange}
          className={validateText(formData.message)}
          placeholder="What can we improve?"
        />
        <Spacer height={16} />
        <button
          type="submit"
          className="se-button type-primary size-medium color-white full-width"
          disabled={state.submitting || !isFormComplete()}
        >
          Submit!
        </button>
        <Spacer height={16} />
      </form>
      {state.succeeded && (
        <Text type="small" align="center" color="white">
          Got it! Thank you so much for reaching out - the Sharing Excess team
          will get back to you ASAP.
        </Text>
      )}
    </main>
  )
}
