import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import { Avatar, Flex, Heading, Link, Text } from '@chakra-ui/react'
import { useAuth } from 'hooks'
import { UserStats } from './User.Stats'

export function UserHeader({ profile, totalWeight }) {
  const { hasAdminPermission } = useAuth()

  return (
    <Flex direction="column" align="center">
      <Avatar src={profile.icon} name={profile.name} size="2xl" mb="4" />
      <Heading>{profile.name}</Heading>
      <UserStats totalWeight={totalWeight} />
      <Flex direction="column" w="100%" maxW="400" gap="4">
        <Flex justify="space-between">
          <Text fontSize="sm" fontWeight="700" mr="1" color="element.secondary">
            Email:
          </Text>

          <Link
            href={`mailto:+${profile.email}`}
            color="element.active"
            textDecoration="underline"
            fontSize="sm"
            fontWeight="300"
            align="right"
          >
            {profile.email}
          </Link>
        </Flex>
        <Flex justify="space-between">
          <Text fontSize="sm" fontWeight="700" mr="1" color="element.secondary">
            Pronouns:
          </Text>
          <Text
            fontSize="sm"
            fontWeight="300"
            color={profile.pronouns ? 'element.primary' : 'element.tertiary'}
          >
            {profile.pronouns || '(not completed)'}
          </Text>
        </Flex>
        <Flex justify="space-between">
          <Text
            fontSize="sm"
            fontWeight="700"
            mr="1"
            color="element.secondary"
            whiteSpace="nowrap"
            pr="8"
          >
            About me:
          </Text>
          <Text
            as="span"
            fontSize="sm"
            align="right"
            color={profile.about_me ? 'element.primary' : 'element.tertiary'}
          >
            {profile.about_me || '(not completed)'}
          </Text>
        </Flex>
        {hasAdminPermission && (
          <Flex justify="space-between">
            <Text
              fontSize="sm"
              fontWeight="700"
              mr="1"
              color="element.secondary"
            >
              Private Profile:
            </Text>
            <Text as="span" fontSize="sm" align="right">
              {profile?.has_completed_private_profile
                ? 'Complete'
                : 'Incomplete'}
            </Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
