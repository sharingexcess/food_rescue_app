import { LockIcon, ViewOffIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react'
import { Liability, FooterButton, FormField } from 'components'
import { SE_API } from 'helpers'
import { useAuth } from 'hooks'
import { useState } from 'react'

export function PrivateProfile({ onSubmitCallback }) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState()
  const [hidden, setHidden] = useState(true)
  const [showLiability, setShowLiability] = useState(false)
  const toast = useToast()

  const [formData, setFormData] = useState({
    email: user.email,
    phone: user.phone || '',
    vehicle_make_model: user.vehicle_make_model || '',
    license_number: user.license_number || '',
    license_state: user.license_state || '',
    insurance_provider: user.insurance_provider || '',
    insurance_policy_number: user.insurance_policy_number || '',
    completed_liability_release: user.completed_liability_release || false,
  })

  async function handleSubmit() {
    setIsLoading(true)
    try {
      await SE_API.post(
        `/privateProfile/${user.uid}/update`,
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
    { id: 'phone', title: 'Phone Number', isValid: formData.phone?.length > 9 },
    {
      id: 'vehicle_make_model',
      title: 'Vehicle Make & Model',
      isValid: formData.vehicle_make_model?.length > 5,
    },
    {
      id: 'license_state',
      title: "Driver's License State",
      isValid: formData.license_state?.length > 1,
    },
    {
      id: 'license_number',
      title: "Driver's License Number",
      isValid: formData.license_number?.length > 4,
    },
    {
      id: 'insurance_provider',
      title: 'Insurance Provider',
      isValid: formData.insurance_provider?.length > 2,
    },
    {
      id: 'insurance_policy_number',
      title: 'Insurance Policy Number',
      isValid: formData.insurance_policy_number?.length > 5,
    },
  ]

  const isFormComplete = (() => {
    let result = true
    for (const field of FIELDS) {
      if (!field.isValid) {
        result = false
        break
      }
    }
    if (!formData.completed_liability_release) return false
    return result
  })()

  return (
    <Box py="6" position="relative">
      {hidden && <BlurOverlay setHidden={setHidden} />}
      {FIELDS.map(i => (
        <FormField
          id={i.id}
          key={i.id}
          title={i.title}
          isValid={i.isValid}
          formData={formData}
          setFormData={setFormData}
        />
      ))}

      <Flex mb="12">
        <Checkbox
          size="lg"
          isInvalid={!formData.completed_liability_release}
          isChecked={formData.completed_liability_release}
          onChange={() =>
            setFormData({
              ...formData,
              completed_liability_release:
                !formData.completed_liability_release,
            })
          }
        ></Checkbox>
        <Text ml="3">
          I agree to the
          <Button
            variant="link"
            textDecoration="underline"
            color="blue.primary"
            onClick={() => setShowLiability(true)}
            ml="1"
          >
            Liability Release
          </Button>
        </Text>
      </Flex>
      {showLiability && (
        <Liability handleClose={() => setShowLiability(false)} />
      )}

      <Box h="8" />

      <FooterButton
        onClick={handleSubmit}
        isLoading={isLoading}
        loadingText="Updating private profile..."
        leftIcon={<ViewOffIcon />}
        disabled={!isFormComplete}
      >
        Update Private Profile
      </FooterButton>
    </Box>
  )
}

function BlurOverlay({ setHidden }) {
  return (
    <Flex
      position="absolute"
      w="100%"
      h="100%"
      backdropFilter="blur(8px)"
      zIndex="10"
      justify="start"
      align="center"
      direction="column"
      gap="4"
    >
      <Heading as="h2" mt="8">
        Private Information
      </Heading>
      <Text mb="8" align="center">
        Only you and the team at Sharing Excess can access this.
      </Text>
      <Button onClick={() => setHidden(false)} leftIcon={<LockIcon />}>
        View Private Profile Info
      </Button>
    </Flex>
  )
}
