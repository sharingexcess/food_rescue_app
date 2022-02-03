import { useForm } from '@formspree/react'
import {
  ExternalLink,
  Spacer,
  Text,
  Dropdown,
} from '@sharingexcess/designsystem'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'

export function NeedHelp() {
  const { user } = useAuth()
  const [state, handleSubmit] = useForm('myyoejgg')
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
    <main id="NeedHelp">
      <Spacer height={16} />
      <form onSubmit={handleSubmit} method="POST">
        <section id="Reasons">
          <select>
            <option>Reasons for needing help ...</option>
            <option>Issue with the App</option>
            <option>Can't Pickup All Food</option>
            <option>Can't Contact Anyone at Location</option>
            <option>Other</option>
          </select>
        </section>
        <Spacer height={16} />
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
          placeholder="Desbribe your issue here"
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
        <Text type="small" align="center" color="green">
          Got it! Thank you so much for reaching out - the Sharing Excess team
          will get back to you ASAP.
        </Text>
      )}
    </main>
  )
}
