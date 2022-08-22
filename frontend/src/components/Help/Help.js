import { useForm } from '@formspree/react'
import { Link, Text, Textarea } from '@chakra-ui/react'
import { FORMSPREE_FORM_ID } from 'helpers'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'
import { PageTitle } from 'components/PageTitle/PageTitle'
import { FooterButton } from 'components/FooterButton/FooterButton'

export function Help() {
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
    <>
      <PageTitle>Get in Touch</PageTitle>
      <Text color="element.secondary" mb="8">
        For immediate support, call the SE team at&nbsp;
        <Link
          href="tel:1833742797"
          color="blue.primary"
          textDecoration="underline"
        >
          1-833-SHAREXS
        </Link>
        .&nbsp; Use the form below to submit any feedback to improve the app, or
        feel free to shoot us an email at{' '}
        <Link
          color="blue.primary"
          textDecoration="underline"
          href="mailto:tech@sharingexcess.com"
        >
          tech@sharingexcess.com
        </Link>
      </Text>
      <form onSubmit={handleSubmit}>
        <input type="hidden" value={user.name} name="name" />
        <input type="hidden" value={user.email} name="email" />
        <input type="hidden" value={user.phone} name="phone" />
        <Textarea
          id="message"
          name="message"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          isInvalid={!validateText(formData.message)}
          placeholder="How can we help?"
          mb="4"
        />
        <FooterButton
          disabled={state.submitting || !isFormComplete()}
          type="submit"
        >
          Submit
        </FooterButton>
      </form>
      {state.succeeded && (
        <Text fontSize="sm" mt="4" color="element.secondary">
          Got it! Thank you so much for reaching out - the Sharing Excess team
          will get back to you ASAP.
        </Text>
      )}
    </>
  )
}
