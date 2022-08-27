import { EditIcon } from '@chakra-ui/icons'
import { Box, IconButton, Text } from '@chakra-ui/react'
import { PageTitle } from 'components/PageTitle/PageTitle'
import { ORG_TYPE_ICONS } from 'helpers'
import { useAuth } from 'hooks'

export function OrganizationHeader({ organization, setEdit }) {
  const { hasAdminPermission } = useAuth()

  return (
    <>
      <Box>
        <PageTitle mb="2">
          {organization.name}
          {organization.is_deleted ? ' (deleted)' : ''}
        </PageTitle>
        <Text textTransform="capitalize" color="element.secondary" mt="1">
          <Text as="span" mr="2">
            {ORG_TYPE_ICONS[organization.subtype]}
          </Text>
          {organization.subtype} {organization.type}
        </Text>
      </Box>

      {hasAdminPermission && (
        <IconButton
          variant="ghosted"
          onClick={() => setEdit(true)}
          disabled={organization.is_deleted}
          icon={<EditIcon w="6" h="6" color="element.tertiary" />}
        />
      )}
    </>
  )
}
