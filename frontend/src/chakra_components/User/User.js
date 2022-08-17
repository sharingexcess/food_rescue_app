import {
  Box,
  Heading,
  Flex,
  Link,
  Skeleton,
  Text,
  Avatar,
  Select,
} from '@chakra-ui/react'
import { Page, RescueCard } from 'chakra_components'
import { useApi, useIsMobile, useAuth } from 'hooks'
import { Error } from 'components'
import { formatPhoneNumber, SE_API } from 'helpers'
import { useParams } from 'react-router-dom'
import { useEffect, useMemo } from 'react'

export function User() {
  const { person_id } = useParams()
  const { admin, user } = useAuth()
  const {
    data: person,
    loading,
    error,
  } = useApi(`/publicProfiles/${person_id}`)

  const { data: rescues } = useApi(
    '/rescues',
    useMemo(
      () => ({
        status: 'completed',
        handler_id: person_id,
        limit: 3,
      }),
      []
    )
  )

  useEffect(() => console.log('rescues', rescues), [person_id])

  function PersonPageWrapper({ children }) {
    return (
      <Page
        id="Person"
        title="Person"
        breadcrumbs={[
          { label: 'People', link: '/people' },
          {
            label: person ? person.name : 'Person',
            link: `/people/${person_id}`,
          },
        ]}
      >
        {children}
      </Page>
    )
  }

  async function handleChange(e) {
    if (!e.target.value || !admin) return
    const id = person_id
    await SE_API.post(
      `/publicProfile/${id}/update`,
      {
        name: person.name,
        email: person.email,
        pronouns: person.pronouns,
        phone: person.phone,
        permission: e.target.value,
      },
      user.accessToken
    )
  }

  if (loading && !person) {
    return <LoadingPerson PersonPageWrapper={PersonPageWrapper} />
  } else if (error) {
    return (
      <PersonPageError PersonPageWrapper={PersonPageWrapper} message={error} />
    )
  } else if (!person) {
    return (
      <PersonPageError
        PersonPageWrapper={PersonPageWrapper}
        message="No Person Found"
      />
    )
  } else
    return (
      <PersonPageWrapper>
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
          <Heading
            as="h1"
            fontWeight="700"
            size="2xl"
            textTransform="capitalize"
            color="element.primary"
            mb={4}
          >
            Person Profile
          </Heading>
          <Avatar src={person.icon} name={person.name} size="2xl" />
          <Text fontSize="lg" fontWeight={700}>
            {person.name}
          </Text>
          {admin && (
            <Link
              href={`mailto:+${person.email}`}
              color="element.active"
              textDecoration="underline"
            >
              {formatPhoneNumber(person.email)}
            </Link>
          )}
          <Text fontSize="sm" fontWeight={300}>
            {person.pronouns}
          </Text>
          {admin && (
            <Link
              href={`tel:+${person.phone}`}
              color="element.active"
              textDecoration="underline"
            >
              {formatPhoneNumber(person.phone)}
            </Link>
          )}
        </Flex>
        {admin && (
          <Flex direction="column" align="center">
            <Text fontWeight={700} mb={4}>
              Access Level
            </Text>
            <Select onChange={handleChange}>
              <option value="">Select user permission level</option>
              <option value="standard">standard</option>
              <option value="admin">admin</option>
            </Select>
          </Flex>
        )}
        <Text fontWeight={700} mt={8}>
          Recently Completed Rescues
        </Text>
        {rescues && rescues.length ? (
          rescues.map((rescue, i) => <RescueCard rescue={rescue} key={i} />)
        ) : (
          <Text mt={8}>{person.name} has no completed rescues</Text>
        )}
      </PersonPageWrapper>
    )
}

function LoadingPerson({ PersonPageWrapper }) {
  const isMobile = useIsMobile()
  return (
    <PersonPageWrapper>
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
    </PersonPageWrapper>
  )
}

function PersonPageError({ PersonPageWrapper, message }) {
  return (
    <PersonPageWrapper>
      <Error message={message} />
    </PersonPageWrapper>
  )
}
