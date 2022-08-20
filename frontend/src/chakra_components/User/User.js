import {
  Box,
  Heading,
  Flex,
  Link,
  Skeleton,
  Text,
  Avatar,
  Select,
  IconButton,
} from '@chakra-ui/react'
import { Page, RescueCard } from 'chakra_components'
import { useApi, useIsMobile, useAuth } from 'hooks'
import { Error } from 'components'
import { SE_API } from 'helpers'
import { useParams } from 'react-router-dom'
import { useEffect, useInsertionEffect, useMemo, useState } from 'react'
import { CheckIcon } from '@chakra-ui/icons'

export function User({ setBreadcrumbs }) {
  const [userPermission, setUserPermission] = useState('')
  const [isLoading, setLoading] = useState(false)
  const { user_id } = useParams()
  const { hasAdminPermission, user } = useAuth()
  const { data: profile, loading, error } = useApi(`/publicProfiles/${user_id}`)

  useEffect(() => {
    profile &&
      setBreadcrumbs([
        { label: 'People', link: '/people' },
        {
          label: profile.name,
          link: `/people/${profile.id}`,
        },
      ])
  }, [profile])

  const { data: rescues } = useApi(
    '/rescues',
    useMemo(
      () => ({
        status: 'completed',
        handler_id: user_id,
        limit: 3,
      }),
      []
    )
  )

  useEffect(() => console.log('rescues', rescues), [user_id])

  useEffect(() => {
    if (profile) setUserPermission(profile.permission)
  }, [profile])

  async function handleChange(e) {
    if (!e.target.value || !hasAdminPermission) return
    setUserPermission(e.target.value)
    // const id = user_id
    // await SE_API.post(
    //   `/publicProfile/${id}/update`,
    //   {
    //     name: profile.name,
    //     email: profile.email,
    //     pronouns: profile.pronouns,
    //     phone: profile.phone,
    //   },
    //   user.accessToken
    // )
  }

  async function changeUserPermission() {
    setLoading(true)
    const id = user_id
    console.log('Id:', id)
    await SE_API.post(
      `/updateUserPermission/${id}`,
      {
        permission: userPermission,
      },
      user.accessToken
    )
    setLoading(true)
  }

  if (loading && !profile) {
    return <LoadingPerson />
  } else if (error) {
    return <PersonPageError message={error} />
  } else if (!profile) {
    return <PersonPageError message="No Person Found" />
  } else
    return (
      <>
        <Flex
          bgGradient="linear(to-b, transparent, surface.background)"
          h="32"
          mt="-32"
          zIndex={1}
          position="relative"
          direction="column"
          justify="flex-end"
        />
        <Flex direction="column" align="center">
          <Avatar src={profile.icon} name={profile.name} size="2xl" />
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
        {hasAdminPermission && profile && (
          <Flex direction="column" align="flex-start" my="8">
            <Text fontWeight={700}>Access Level</Text>
            <Flex w="100%" gap="4">
              <Select
                variant="flushed"
                onChange={handleChange}
                flexGrow="1"
                value={userPermission}
              >
                <option value="">Select user permission level</option>
                <option value="\0">None</option>
                <option value="standard">Standard</option>
                <option value="admin">Admin</option>
              </Select>
              <IconButton
                disabled={userPermission === profile.permission}
                onClick={changeUserPermission}
                icon={<CheckIcon />}
                isLoading={isLoading}
              />
            </Flex>
          </Flex>
        )}
        <Text fontWeight={700} mt={8}>
          Recently Completed Rescues
        </Text>
        {rescues && rescues.length ? (
          rescues.map((rescue, i) => <RescueCard rescue={rescue} key={i} />)
        ) : (
          <Text mt={8}>{profile.name} has no completed rescues</Text>
        )}
      </>
    )
}

function LoadingPerson() {
  const isMobile = useIsMobile()
  return (
    <>
      <Box px="4">
        <Heading
          as="h1"
          fontWeight="700"
          size="2xl"
          mb="6"
          mt="4"
          textTransform="capitalize"
          color="element.primary"
        >
          Loading Person...
        </Heading>
        <Skeleton h="320px" mt={isMobile ? '64px' : 0} />
        <Text as="h2" fontWeight={700} size="lg" textTransform="capitalize">
          Recent Rescues
        </Text>
        <Skeleton h="32" my="4" />
        <Skeleton h="32" my="4" />
        <Skeleton h="32" my="4" />
      </Box>
    </>
  )
}

function PersonPageError({ message }) {
  return <Error message={message} />
}
