import { Box, Button, Flex, Skeleton } from '@chakra-ui/react'
import { useApi, useAuth } from 'hooks'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { PageTitle, Error } from 'components'
import { Locations } from './Organization.Locations'
import { Tags } from './Organization.Tags'
import { OrganizationHeader } from './Organization.Header'
import { EditOrganization } from './Organization.Edit'

export function Organization({ setBreadcrumbs }) {
  const { organization_id } = useParams()
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
      setBreadcrumbs([
        { label: 'Organizations', link: '/organizations' },
        { label: organization.name, link: `/organizations/${organization.id}` },
      ])
    }
  }, [organization])

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
