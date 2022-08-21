import {
  CheckIcon,
  LockIcon,
  StarIcon,
  ViewIcon,
  ViewOffIcon,
} from '@chakra-ui/icons'
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react'
import { FormField, Liability } from 'chakra_components'
import { SE_API } from 'helpers'
import { useAuth, useIsMobile } from 'hooks'
import { useState } from 'react'

export function Profile({ onSubmitCallback }) {
  const search_params = new URLSearchParams(window.location.search)
  const cached_tab = search_params.get('tab')
  const [tab, setTab] = useState(cached_tab || 'public')

  return (
    <>
      <Heading
        as="h1"
        fontWeight="700"
        size="2xl"
        mb="8"
        textTransform="capitalize"
        color="element.primary"
      >
        Your Profile
      </Heading>
      <ProfileHeader tab={tab} setTab={setTab} />
      {tab === 'public' ? (
        <PublicProfile onSubmitCallback={onSubmitCallback} />
      ) : (
        <PrivateProfile onSubmitCallback={onSubmitCallback} />
      )}
    </>
  )
}

function ProfileHeader({ tab, setTab }) {
  const { user } = useAuth()

  return (
    <Flex justify="start" align="center" direction="column" w="100%">
      <Avatar
        name={user.displayName}
        src={user.photoURL}
        bg="blue.500"
        color="white"
        w="128px"
        h="128px"
        mb="4"
      />
      <Heading as="h3" color="element.primary" mb="1">
        {user.name}
      </Heading>
      <Text color="element.secondary">{user.email}</Text>
      <Text color="element.secondary" mb="8">
        {user.permission === 'admin' ? (
          <>
            <StarIcon /> Admin Access
          </>
        ) : (
          <>
            <CheckIcon /> Standard Access
          </>
        )}
      </Text>
      <Flex gap="4">
        <Button
          variant={tab === 'public' ? 'secondary' : 'tertiary'}
          onClick={() => setTab('public')}
          leftIcon={<ViewIcon />}
        >
          Public
        </Button>
        <Button
          variant={tab === 'private' ? 'secondary' : 'tertiary'}
          onClick={() => setTab('private')}
          leftIcon={<ViewOffIcon />}
        >
          Private
        </Button>
      </Flex>
    </Flex>
  )
}

function PublicProfile({ onSubmitCallback }) {
  const { user } = useAuth()
  const isMobile = useIsMobile()
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

      <Button
        size="lg"
        position={isMobile ? 'fixed' : 'relative'}
        w={isMobile ? 'calc(100% - 32px)' : null}
        bottom={isMobile ? '4' : null}
        left={isMobile ? '4' : null}
        onClick={handleSubmit}
        isLoading={isLoading}
        loadingText="Updating public profile..."
        leftIcon={<ViewIcon />}
        disabled={!isFormComplete}
        zIndex="8"
      >
        Update Public Profile
      </Button>
    </Box>
  )
}

function PrivateProfile({ onSubmitCallback }) {
  const { user } = useAuth()
  const isMobile = useIsMobile()
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
      {hidden && (
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
      )}
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

      <Button
        size="lg"
        position={isMobile ? 'fixed' : 'relative'}
        w={isMobile ? 'calc(100% - 32px)' : null}
        bottom={isMobile ? '4' : null}
        left={isMobile ? '4' : null}
        onClick={handleSubmit}
        isLoading={isLoading}
        loadingText="Updating private profile..."
        leftIcon={<ViewOffIcon />}
        disabled={!isFormComplete}
        zIndex="8"
      >
        Update Private Profile
      </Button>
    </Box>
  )
}
