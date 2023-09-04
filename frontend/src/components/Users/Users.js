import { SearchIcon } from '@chakra-ui/icons'
import {
  Avatar,
  Box,
  Divider,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  Text,
} from '@chakra-ui/react'
import { PageTitle } from 'components/PageTitle/PageTitle'
import { useApi, useAuth } from 'hooks'
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

export function Users() {
  const { data: users } = useApi('/public_profiles/list')
  const [searchValue, setSearchValue] = useState('')

  const { user } = useAuth()

  function handleChange(e) {
    setSearchValue(e.target.value)
  }

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

  return (
    <>
      <PageTitle>People</PageTitle>
      <InputGroup mb="6">
        <InputLeftElement mr="2" color="element.secondary">
          <SearchIcon />
        </InputLeftElement>
        <Input
          placeholder="Search by name..."
          value={searchValue}
          onChange={handleChange}
        />
      </InputGroup>
      {users ? (
        users
          .filter(i => i.name.toLowerCase().includes(searchValue.toLowerCase()))
          .map((user, i) => (
            <Box key={i}>
              <UserCard user={user} />
              {i !== users.length - 1 && <Divider />}
            </Box>
          ))
      ) : (
        <>
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
        </>
      )}
    </>
  )
}

function UserCard({ user }) {
  return (
    <Link to={`/people/${user.id}`}>
      <Flex justify="start" align="center" py="4">
        <Avatar src={user?.icon} name={user?.name} />
        <Flex direction="column" ml="4">
          <Heading as="h2" size="md" fontWeight="600" color="element.primary">
            {user?.name || 'User'}
          </Heading>
          <Text color="element.secondary" fontSize="xs">
            {user?.email || 'Email'}
          </Text>
        </Flex>
        <Text ml="auto">{permissionIcon(user?.permission)}</Text>
      </Flex>
    </Link>
  )
}

function permissionIcon(permission) {
  return permission === 'admin' ? '👑' : permission === 'standard' ? '🚛' : ''
}
