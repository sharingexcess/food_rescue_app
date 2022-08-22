import { CheckIcon, StarIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { Avatar, Button, Flex, Heading, Text } from '@chakra-ui/react'
import { PageTitle } from 'components'
import { useAuth } from 'hooks'
import { useState } from 'react'
import { PrivateProfile } from './Profile.Private'
import { PublicProfile } from './Profile.Public'

export function Profile({ onSubmitCallback }) {
  const search_params = new URLSearchParams(window.location.search)
  const cached_tab = search_params.get('tab')
  const [tab, setTab] = useState(cached_tab || 'public')

  return (
    <>
      <PageTitle>Your Profile</PageTitle>
      <ProfileHeader tab={tab} setTab={setTab} />
      {tab === 'public' ? (
        <PublicProfile onSubmitCallback={onSubmitCallback} />
      ) : (
        <PrivateProfile onSubmitCallback={onSubmitCallback} />
      )}
    </>
  )
}

function ProfileHeader({ tab, setTab }) {
  const { user } = useAuth()

  return (
    <Flex justify="start" align="center" direction="column" w="100%">
      <Avatar
        name={user.displayName}
        src={user.photoURL}
        bg="blue.500"
        color="white"
        w="128px"
        h="128px"
        mb="4"
        size="2xl"
      />
      <Heading as="h3" color="element.primary" mb="1">
        {user.name}
      </Heading>
      <Text color="element.secondary">{user.email}</Text>
      <Text color="element.secondary" mb="8">
        {user.permission === 'admin' ? (
          <>
            <StarIcon /> Admin Access
          </>
        ) : (
          <>
            <CheckIcon /> Standard Access
          </>
        )}
      </Text>
      <Flex gap="4">
        <Button
          variant={tab === 'public' ? 'secondary' : 'tertiary'}
          onClick={() => setTab('public')}
          leftIcon={<ViewIcon />}
        >
          Public
        </Button>
        <Button
          variant={tab === 'private' ? 'secondary' : 'tertiary'}
          onClick={() => setTab('private')}
          leftIcon={<ViewOffIcon />}
        >
          Private
        </Button>
      </Flex>
    </Flex>
  )
}
