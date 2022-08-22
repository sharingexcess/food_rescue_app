import { CheckIcon } from '@chakra-ui/icons'
import { Flex, IconButton, Select, Text, useToast } from '@chakra-ui/react'
import { SE_API } from 'helpers'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'

export function UserPermission({ profile, refresh }) {
  const [userPermission, setUserPermission] = useState('')
  const [isLoading, setLoading] = useState(false)
  const toast = useToast()
  const { user, hasAdminPermission } = useAuth()

  useEffect(() => {
    if (profile) setUserPermission(profile.permission)
  }, [profile])

  async function handleChange(e) {
    if (!e.target.value || !hasAdminPermission) return
    setUserPermission(e.target.value)
  }

  async function updateUserPermission() {
    setLoading(true)
    await SE_API.post(
      `/updateUserPermission/${profile.id}`,
      {
        permission: userPermission,
      },
      user.accessToken
    )
    toast({
      title: 'All set!',
      description: 'Permission has been updated.',
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top',
    })
    refresh()
    setLoading(false)
  }

  return hasAdminPermission && profile?.id !== user.id ? (
    <Flex direction="column" align="flex-start" pt="8">
      <Text fontWeight={700}>Access Level</Text>
      <Flex w="100%" gap="4">
        <Select onChange={handleChange} flexGrow="1" value={userPermission}>
          <option value="">Select user permission level</option>
          <option value="\0">None</option>
          <option value="standard">Standard</option>
          <option value="admin">Admin</option>
        </Select>
        <IconButton
          disabled={userPermission === profile.permission}
          onClick={updateUserPermission}
          icon={<CheckIcon />}
          borderRadius="3xl"
          isLoading={isLoading}
        />
      </Flex>
    </Flex>
  ) : null
}
