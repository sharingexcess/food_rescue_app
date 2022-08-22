import { Avatar, Flex, Link, Text } from '@chakra-ui/react'
import { useAuth } from 'hooks'

export function UserHeader({ profile }) {
  const { hasAdminPermission } = useAuth()

  return (
    <Flex direction="column" align="center">
      <Avatar src={profile.icon} name={profile.name} size="2xl" mb="4" />
      <Text fontSize="lg" fontWeight={700}>
        {profile.name}
      </Text>
      {hasAdminPermission && (
        <Link
          href={`mailto:+${profile.email}`}
          color="element.active"
          textDecoration="underline"
        >
          {profile.email}
        </Link>
      )}
      <Text fontSize="sm" fontWeight={300}>
        {profile.pronouns}
      </Text>
    </Flex>
  )
}
