import {
  Box,
  Button,
  Flex,
  Skeleton,
  Heading,
  Text,
  Input,
  IconButton,
  useToast,
} from '@chakra-ui/react'
import { useApi, useAuth } from 'hooks'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { PageTitle, Error } from 'components'
import { Locations } from './Organization.Locations'
import { Tags } from './Organization.Tags'
import { OrganizationHeader } from './Organization.Header'
import { EditOrganization } from './Organization.Edit'
import { SE_API } from 'helpers'
import { CloseIcon } from '@chakra-ui/icons'

export function Organization({ setBreadcrumbs, setTitle }) {
  const { organization_id } = useParams()
  const { user } = useAuth()
  const toast = useToast()

  const {
    data: organization,
    loading,
    error,
    refresh,
  } = useApi(`/organizations/get/${organization_id}`)

  const { data: users } = useApi(
    '/public_profiles/list',
    useMemo(() => ({}), [])
  )

  const { data: organizations } = useApi(
    '/organizations/list',
    useMemo(() => ({ type: 'donor' }), [])
  )

  function getDashboardAccess() {
    if (organizations) {
      for (const org of organizations) {
        const dashboard_access = org.dashboard_access
        if (dashboard_access) {
          if (dashboard_access.includes(user.email)) {
            localStorage.setItem('se_dashboard_access', true)
            return true
          }
        }
      }
    }
    localStorage.setItem('se_dashboard_access', false)
    return false
  }

  getDashboardAccess()

  const [edit, setEdit] = useState(false)
  const [formData, setFormData] = useState({})
  const { hasAdminPermission } = useAuth()
  const [userData, setUserData] = useState({})
  const [selectedEmails, setSelectedEmails] = useState([])

  useEffect(() => {
    if (organization) {
      setSelectedEmails(organization.dashboard_access || [])
    }
  }, [organization])

  useEffect(() => {
    if (organization) {
      setFormData(organization)
      setTitle(organization.name)
      setBreadcrumbs([
        { label: 'Organizations', link: '/organizations' },
        { label: organization.name, link: `/organizations/${organization.id}` },
      ])
    }
  }, [organization])

  // add users to the state
  useEffect(() => {
    if (users) {
      setUserData(users)
    }
  }, [users])

  async function addUser() {
    const searchTerm = formData.user_email.toLowerCase().trim()
    const matchingUser = userData.find(user =>
      user.email.toLowerCase().includes(searchTerm)
    )

    if (matchingUser) {
      const newSelectedEmails = [...selectedEmails, matchingUser.email]
      setSelectedEmails(newSelectedEmails)
    } else {
      setSelectedEmails([...selectedEmails, formData.user_email])
    }
  }

  // [TODO]
  async function updateOrg() {
    const accessToken = user.accessToken

    // Selected emails from the document
    const existing_users = formData.dashboard_access || []

    let update_dashboard_access = []

    // Find new users to add
    const new_user_emails = selectedEmails.filter(
      email => !existing_users.includes(email)
    )

    // Find users to remove
    const removed_user_emails = existing_users.filter(
      email => !selectedEmails.includes(email)
    )

    // Create a new list that does not include removed users and includes new users
    update_dashboard_access = [
      ...existing_users.filter(email => !removed_user_emails.includes(email)),
      ...new_user_emails,
    ]

    await SE_API.post(
      `/organizations/update/${organization_id}`,
      {
        ...formData,
        is_deleted: false,
        dashboard_access: update_dashboard_access,
      },
      accessToken
    )

    toast({
      title: 'Org Updated!',
      description: 'Successfully updated dashboard access',
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top',
    })
  }

  function handleDeleteEmail(email) {
    const updatedEmails = selectedEmails.filter(e => e !== email)
    setSelectedEmails(updatedEmails)
  }

  function Card({ email, onDelete }) {
    return (
      <Flex
        align="center"
        px="3"
        py="2"
        bg="gray.600"
        borderRadius="md"
        mt="2"
        mr="2"
      >
        <Text>{email}</Text>
        <IconButton
          icon={<CloseIcon />}
          ml="2"
          variant="ghost"
          onClick={onDelete}
        />
      </Flex>
    )
  }

  if (loading && !organization) {
    return <LoadingOrganization />
  } else if (error) {
    return <OrganizationPageError message={error} />
  } else if (!organization) {
    return <OrganizationPageError message="No Organization Found" />
  } else
    return (
      <>
        <Flex w="100%" mb="4" justify="space-between" align="start" gap="2">
          {edit ? (
            <EditOrganization
              formData={formData}
              setFormData={setFormData}
              setEdit={setEdit}
              refresh={refresh}
            />
          ) : (
            <OrganizationHeader organization={organization} setEdit={setEdit} />
          )}
        </Flex>
        {!organization.is_deleted && (
          <>
            <Tags formData={formData} setFormData={setFormData} />
            <Locations organization={organization} />
            {hasAdminPermission && (
              <Flex w="100%" justify="center" mt="8" gap="4">
                <Link to={`/organizations/${organization.id}/create-location`}>
                  <Button>+ Add Location</Button>
                </Link>
              </Flex>
            )}
            {hasAdminPermission && (
              <Box mt="8">
                <Heading as="h2" size="md" mb="4">
                  Dashboard Access Users
                </Heading>
                <Flex justify="center" align="center" gap="4">
                  <Input
                    placeholder="Search by name or email"
                    value={formData.user_email || ''}
                    onChange={e =>
                      setFormData({ ...formData, user_email: e.target.value })
                    }
                  />
                  <Button onClick={addUser}>Add User</Button>
                </Flex>
                <Flex mt="4" flexWrap="wrap">
                  {selectedEmails.map(email => (
                    <Card
                      key={email}
                      email={email}
                      onDelete={() => handleDeleteEmail(email)}
                    />
                  ))}
                </Flex>
                <Box display={'flex'} justifyContent={'space-between'}>
                  <Flex mt="4">
                    <Button onClick={updateOrg}>Update Permissions</Button>
                  </Flex>
                  <Flex mt="4">
                    <Link mt="4" to={`/dashboards/${organization.id}`}>
                      <Button>View Dashboard</Button>
                    </Link>
                  </Flex>
                </Box>
              </Box>
            )}
          </>
        )}
      </>
    )
}

function LoadingOrganization() {
  return (
    <>
      <Box px="4">
        <PageTitle>Loading...</PageTitle>
        <Skeleton h="32" my="4" />
        <Skeleton h="32" my="4" />
        <Skeleton h="32" my="4" />
        <Skeleton h="32" my="4" />
        <Skeleton h="32" my="4" />
      </Box>
    </>
  )
}

function OrganizationPageError({ message }) {
  return <Error message={message} />
}
