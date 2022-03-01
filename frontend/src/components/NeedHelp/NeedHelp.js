import { useForm } from '@formspree/react'
import { ExternalLink, Spacer, Text } from '@sharingexcess/designsystem'
import { useAuth, useApp } from 'hooks'
import { useEffect, useMemo, useState } from 'react'

export function NeedHelp() {
  const { user } = useAuth()
  const [state, handleSubmit] = useForm('myyoejgg')
  const { setModal } = useApp()
  const [issue, setIssue] = useState('')
  const initFormData = useMemo(
    () => ({
      name: user.name,
      email: user.email,
      phone: user.phone,
      message: '',
      issue: '',
    }),
    [user]
  )
  const [formData, setFormData] = useState(initFormData)

  useEffect(() => {
    if (state.succeeded) {
      setFormData(initFormData)
    }
  }, [state.succeeded, initFormData])

  function handleChange(e) {
    setFormData(data => ({ ...data, [e.target.id]: e.target.value }))
  }

  function validateText(text) {
    if (typeof text === 'string') {
      return text.length ? 'valid' : 'invalid'
    } else return undefined
  }

  function isFormComplete() {
    return formData.message && formData.issue
  }

  return (
    <main id="NeedHelp">
      <Text type="secondary-header" color="black" align="left">
        Rescue Help
      </Text>
      <Spacer height={8} />
      <form onSubmit={handleSubmit} method="POST">
        <Text type="paragraph" color="grey" align="left">
          What's going on?
        </Text>
        <Spacer height={8} />
        <select
          id="issues"
          value={issue}
          onChange={e => {
            setIssue(e.target.value)
            setFormData(data => ({
              ...data,
              issue: e.target.value,
            }))
          }}
        >
          <option>Select an issue...</option>
          <option value="Can't Pickup All Food">Can't Pickup All Food</option>
          <option value="Issue with the App">Issue with the App</option>
          <option value="Can't Contact Donor/Recipient">
            Can't Contact Donor/Recipient
          </option>
          <option value="other">Other</option>
        </select>
        <Spacer height={16} />
        <input type="hidden" value={user.name} name="name" />
        <input type="hidden" value={user.email} name="email" />
        <input type="hidden" value={user.phone} name="phone" />
        <input type="hidden" value={issue} name="issue" />
        <Text type="paragraph" color="grey" align="left">
          How can we help?
        </Text>
        <Spacer height={8} />
        <textarea
          id="message"
          name="message"
          rows={3}
          value={formData.message}
          onChange={handleChange}
          className={validateText(formData.message)}
          placeholder="Describe your issue here..."
        />
        <Spacer height={16} />
        <button
          type="submit"
          className="se-button type-primary size-medium color-green full-width"
          disabled={state.submitting || !isFormComplete()}
          handler={() => setModal(false)}
        >
          Submit!
        </button>
        <Spacer height={24} />
      </form>
      {state.succeeded && (
        <Text type="small" align="center" color="grey">
          Got it! The Sharing Excess team will get back to you as soon as
          possible.
          <Spacer height={12} />
          If you need immediate help, call Hannah at&nbsp;
          <ExternalLink to="tel:1-833-742-7397">1 (833) 742-7397</ExternalLink>
        </Text>
      )}
    </main>
  )
}
