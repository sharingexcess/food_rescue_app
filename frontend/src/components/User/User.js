import { Box, Button, Flex, Skeleton, Text } from '@chakra-ui/react'
import { RescueCard, PageTitle, Error } from 'components'
import { useApi, useIsMobile } from 'hooks'
import { useParams } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { UserStats } from './User.Stats'
import { UserHeader } from './User.Header'
import { UserPermission } from './User.Permission'
import moment from 'moment'

export function User({ setBreadcrumbs }) {
  const { user_id } = useParams()

  const {
    data: profile,
    loading,
    error,
    refresh,
  } = useApi(`/publicProfiles/${user_id}`)

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

  const {
    data: rescues,
    loadMore,
    loading: loadingRescues,
  } = useApi(
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

  if (loading && !profile) {
    return <LoadingUser />
  } else if (error) {
    return <UserError message={error} />
  } else if (!profile) {
    return <UserError message="No Person Found" />
  } else
    return (
      <>
        <UserHeader profile={profile} />
        <UserStats totalWeight={totalWeight} />
        <UserPermission profile={profile} refresh={refresh} />
        <Text fontWeight="700" mt="12">
          Recently Completed Rescues
        </Text>
        {rescues && rescues.length ? (
          rescues.map((rescue, i) => <RescueCard rescue={rescue} key={i} />)
        ) : (
          <Text mt={8}>{profile.name} has no completed rescues</Text>
        )}
        <Flex width="100%" my="4" justify="center">
          <Button
            alignSelf="center"
            variant="primary"
            onClick={loadMore}
            isLoading={loadingRescues}
            loadingText="Loading more..."
            disabled={!loadMore || loadingRescues}
          >
            {loadMore ? 'Load More' : 'Loaded all rescues'}
          </Button>
        </Flex>
      </>
    )
}

function LoadingUser() {
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

function UserError({ message }) {
  return <Error message={message} />
}
