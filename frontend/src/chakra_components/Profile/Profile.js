import {
  CheckIcon,
  EditIcon,
  LockIcon,
  ViewIcon,
  ViewOffIcon,
} from '@chakra-ui/icons'
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useToast,
} from '@chakra-ui/react'
import { Page } from 'chakra_components'
import { SE_API } from 'helpers'
import { useAuth, useIsMobile } from 'hooks'
import { useState } from 'react'

export function Profile() {
  const [tab, setTab] = useState('public')
  const { user } = useAuth()

  return (
    <Page
      title="Profile"
      breadcrumbs={[{ label: 'Profile', link: '/chakra/profile' }]}
    >
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
      {tab === 'public' ? <PublicProfile /> : <PrivateProfile />}
    </Page>
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
      <Heading as="h3" color="element.primary">
        {user.name}
      </Heading>
      <Text color="element.secondary" mb="8">
        {user.email}
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

function PublicProfile() {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [isLoading, setIsLoading] = useState()
  const toast = useToast()

  const [formData, setFormData] = useState({
    email: user.email,
    name: user.name || '',
    pronouns: user.pronouns || '',
    phone: user.phone || '',
  })

  async function handleSubmit() {
    setIsLoading(true)
    try {
      await SE_API.post(
        `/privateProfile/${user.id}/update`,
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
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top',
    })
    setIsLoading(false)
  }

  const FIELDS = [
    { id: 'name', title: 'Name', isValid: formData.name?.length > 2 },
    {
      id: 'pronouns',
      title: 'Preferred Pronouns',
      isValid: formData.pronouns?.length > 2,
    },
    { id: 'phone', title: 'Phone Number', isValid: formData.phone?.length > 9 },
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

function PrivateProfile() {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [isLoading, setIsLoading] = useState()
  const toast = useToast()
  const [formData, setFormData] = useState({
    email: user.email,
    vehicle_make_model: user.vehicle_make_model || '',
    license_number: user.license_number || '',
    license_state: user.license_state || '',
    insurance_provider: user.insurance_provider || '',
    insurance_policy_number: user.insurance_policy_number || '',
  })
  const [hidden, setHidden] = useState(true)

  async function handleSubmit() {
    setIsLoading(true)
    try {
      await SE_API.post(
        `/privateProfile/${user.id}/update`,
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
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top',
    })
    setIsLoading(false)
  }

  const FIELDS = [
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
    return result
  })()

  return (
    <Box py="6">
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

function FormField({ formData, setFormData, title, id, isValid }) {
  return (
    <>
      <Text fontWeight="600">{title}</Text>
      <InputGroup>
        <Input
          type="text"
          variant="flushed"
          value={formData[id]}
          onChange={e => setFormData({ ...formData, [id]: e.target.value })}
          isInvalid={!isValid}
          mb="8"
        />
        {isValid && (
          <InputRightElement
            children={<CheckIcon color="se.brand.primary" />}
          />
        )}
      </InputGroup>
    </>
  )
}
