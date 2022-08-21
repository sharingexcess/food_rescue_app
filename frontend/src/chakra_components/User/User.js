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
  useToast,
  Fade,
  Spinner,
} from '@chakra-ui/react'
import { RescueCard, PageTitle } from 'chakra_components'
import { useApi, useIsMobile, useAuth } from 'hooks'
import { Error } from 'components'
import { formatLargeNumber, SE_API } from 'helpers'
import { useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { CheckIcon } from '@chakra-ui/icons'
import moment from 'moment'

export function User({ setBreadcrumbs }) {
  const [userPermission, setUserPermission] = useState('')
  const [isLoading, setLoading] = useState(false)
  const { user_id } = useParams()
  const { hasAdminPermission, user } = useAuth()

  const {
    data: profile,
    loading,
    error,
    refresh,
  } = useApi(`/publicProfiles/${user_id}`)

  const toast = useToast()

  const { data: deliveries } = useApi(
    '/stops',
    useMemo(
      () => ({
        status: 'completed',
        handler_id: user_id,
        date_range_start: moment().subtract(1, 'year').format('YYYY-MM-DD'),
        date_range_finish: moment().format('YYYY-MM-DD'),
      }),
      []
    )
  )

  const totalWeight = useMemo(
    () =>
      deliveries &&
      deliveries.reduce(
        (total, current) => (total += current.impact_data_total_weight),
        0
      ),
    [deliveries]
  )

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
  }

  async function updateUserPermission() {
    setLoading(true)
    await SE_API.post(
      `/updateUserPermission/${user_id}`,
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
        <Stats totalWeight={totalWeight} />
        {hasAdminPermission && profile && profile.id !== user.id && (
          <Flex direction="column" align="flex-start" pt="8">
            <Text fontWeight={700}>Access Level</Text>
            <Flex w="100%" gap="4">
              <Select
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
                onClick={updateUserPermission}
                icon={<CheckIcon />}
                borderRadius="3xl"
                isLoading={isLoading}
              />
            </Flex>
          </Flex>
        )}
        <Text fontWeight="700" mt="12">
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
        <PageTitle>Loading Person...</PageTitle>
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

function Stats({ totalWeight }) {
  const isMobile = useIsMobile()

  return (
    <Fade in>
      <Flex
        mt="8"
        px={isMobile ? '4' : '8'}
        py="4"
        gap="4"
        zIndex="3"
        position="relative"
        direction="column"
      >
        <Flex
          borderRadius="md"
          justify="center"
          align="center"
          direction="column"
          w="100%"
        >
          <Heading color="element.primary">
            {totalWeight == null ? (
              <Spinner />
            ) : (
              formatLargeNumber(totalWeight) + ' lbs.'
            )}
          </Heading>
          <Text color="se.brand.primary">rescued this year</Text>
        </Flex>
      </Flex>
    </Fade>
  )
}
