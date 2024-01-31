import {
  Box,
  Button,
  Flex,
  Skeleton,
  Heading,
  Text,
  // useToast,
} from '@chakra-ui/react'
import { useApi, useAuth } from 'hooks'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { PageTitle, Error } from 'components'
import { Locations } from './Organization.Locations'
import { Tags } from './Organization.Tags'
import { OrganizationHeader } from './Organization.Header'
import { EditOrganization } from './Organization.Edit'
// import { SE_API } from 'helpers'

export function Organization({ setBreadcrumbs, setTitle }) {
  const { organization_id } = useParams()
  // const { user } = useAuth()
  // const toast = useToast()

  const {
    data: organization,
    loading,
    error,
    refresh,
  } = useApi(`/organizations/get/${organization_id}`)

  const [edit, setEdit] = useState(false)
  const [formData, setFormData] = useState({})
  const { hasAdminPermission } = useAuth()

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

  // async function updateOrg() {
  //   const accessToken = user.accessToken

  //   // const data = []

  //   await SE_API.post(
  //     `/organizations/update/${organization_id}`,
  //     {
  //       ...formData,
  //       is_deleted: false,
  //     },
  //     accessToken
  //   )

  //   toast({
  //     title: 'Org Updated!',
  //     description: 'Successfully updated dashboard access',
  //     status: 'info',
  //     duration: 2000,
  //     isClosable: true,
  //     position: 'top',
  //   })
  // }

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
                <Heading as="h2" size="md">
                  Dashboard
                </Heading>
                <Box display={'flex'} flexDirection={'column'}>
                  <Flex mt="4">
                    <Link mt="4" to={`/dashboards/${organization.id}`}>
                      <Button>View Internal Dashboard</Button>
                    </Link>
                  </Flex>
                  <Box
                    mt="4"
                    p="4"
                    borderWidth="0.5px"
                    borderRadius="lg"
                    borderColor="gray.200"
                    boxShadow="sm"
                    maxWidth="100%"
                    overflowX="auto"
                  >
                    <Flex direction={['column', 'row']} wrap="wrap">
                      <Text fontSize="lg" fontWeight="bold" mr="2">
                        External Link:
                      </Text>
                      {organization.dashboard_url ? (
                        <a
                          href={`${organization.dashboard_url}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 'lg', color: 'blue.500' }}
                          _hover={{ textDecoration: 'underline' }}
                        >
                          <Text
                            color="teal.500"
                            _hover={{
                              color: 'teal.500',
                              textDecoration: 'underline',
                            }}
                            isTruncated
                          >
                            {organization.dashboard_url}
                          </Text>
                        </a>
                      ) : (
                        <Text fontSize="lg" color="gray.500">
                          Not Enabled
                        </Text>
                      )}
                    </Flex>
                    <Flex mt="4" direction={['column', 'row']} wrap="wrap">
                      <Text fontSize="lg" fontWeight="bold" mr="2">
                        Password:
                      </Text>
                      {organization.dashboard_pass ? (
                        <Text fontSize="lg" color="gray.500" isTruncated>
                          {organization.dashboard_pass}
                        </Text>
                      ) : (
                        <Text fontSize="lg" color="gray.500">
                          Not Enabled
                        </Text>
                      )}
                    </Flex>
                  </Box>

                  {/* <Flex mt="4">
                    <Button onClick={updateOrg}>Update</Button>
                  </Flex> */}
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
