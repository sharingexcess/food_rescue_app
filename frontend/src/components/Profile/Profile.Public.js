import { ViewIcon } from '@chakra-ui/icons'
import { Box, useToast } from '@chakra-ui/react'
import { FooterButton, FormField } from 'components'
import { SE_API } from 'helpers'
import { useAuth } from 'hooks'
import { useState } from 'react'

export function PublicProfile({ onSubmitCallback }) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState()
  const toast = useToast()

  const [formData, setFormData] = useState({
    email: user.email,
    name: user.name || '',
    pronouns: user.pronouns || '',
    about_me: user.about_me || '',
  })

  async function handleSubmit() {
    setIsLoading(true)
    try {
      await SE_API.post(
        `/publicProfile/${user.uid}/update`,
        formData,
        user.accessToken
      )
    } catch (e) {
      toast({
        title: 'Whoops!',
        description:
          'Looks like there was an error updating your profile. Make sure you filled out all of the fields correctly.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      return
    }
    toast({
      title: 'All set!',
      description: 'Your profile has been updated.',
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top',
    })
    setIsLoading(false)
    onSubmitCallback && onSubmitCallback()
  }

  const FIELDS = [
    { id: 'name', title: 'Name', isValid: formData.name?.length > 2 },
    {
      id: 'pronouns',
      title: 'Preferred Pronouns',
      isValid: formData.pronouns?.length > 2,
    },
    { id: 'about_me', title: 'About Me', isValid: true, isOptional: true },
  ]

  const isFormComplete = (() => {
    let result = true
    for (const field of FIELDS) {
      if (!field.isValid) {
        result = false
        break
      }
    }
    return result
  })()

  return (
    <Box py="6">
      {FIELDS.map(i => (
        <FormField
          id={i.id}
          key={i.id}
          title={i.title}
          isValid={i.isValid}
          formData={formData}
          setFormData={setFormData}
          isOptional={i.isOptional}
        />
      ))}

      <Box h="8" />

      <FooterButton
        onClick={handleSubmit}
        isLoading={isLoading}
        loadingText="Updating public profile..."
        leftIcon={<ViewIcon />}
        disabled={!isFormComplete}
      >
        Update Public Profile
      </FooterButton>
    </Box>
  )
}
