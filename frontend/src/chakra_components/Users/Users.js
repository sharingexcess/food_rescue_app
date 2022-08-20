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
import { useApi } from 'hooks'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function Users() {
  const { data: users } = useApi('/publicProfiles')
  const [searchValue, setSearchValue] = useState('')

  function handleChange(e) {
    setSearchValue(e.target.value)
  }

  return (
    <>
      <Heading
        as="h1"
        fontWeight="700"
        size="2xl"
        mb="24px"
        textTransform="capitalize"
        color="element.primary"
      >
        People
      </Heading>
      <InputGroup mb="6">
        <InputLeftElement
          children={<SearchIcon />}
          mr="2"
          color="element.secondary"
        />
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
