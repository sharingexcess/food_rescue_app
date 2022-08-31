import { Flex, Select, Text, useToast } from '@chakra-ui/react'
import { SE_API } from 'helpers'
import { useAuth } from 'hooks'
import { useEffect, useState } from 'react'

export function UserPermission({ profile, refresh }) {
  const [userPermission, setUserPermission] = useState('')
  const toast = useToast()
  const { user, hasAdminPermission } = useAuth()

  useEffect(() => {
    if (profile) setUserPermission(profile.permission)
  }, [profile])

  async function handleChange(e) {
    if (!e.target.value || !hasAdminPermission) return
    setUserPermission(e.target.value)
    updateUserPermission(e.target.value)
  }

  async function updateUserPermission(permission) {
    if (permission === 'None') permission = null
    await SE_API.post(
      `/updateUserPermission/${profile.id}`,
      {
        permission,
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
  }

  return hasAdminPermission && profile?.id !== user.id ? (
    <Flex
      w="100%"
      gap="4"
      mt="2"
      maxW="400"
      mx="auto"
      align="center"
      justify="space-between"
    >
      <Text
        fontWeight="700"
        color="element.secondary"
        fontSize="sm"
        flexShrink="0"
        pr="4"
      >
        Access Level
      </Text>
      <Select onChange={handleChange} value={userPermission} w="32">
        <option>None</option>
        <option value="standard">Standard</option>
        <option value="admin">Admin</option>
      </Select>
    </Flex>
  ) : null
}
