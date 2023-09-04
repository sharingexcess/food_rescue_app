import { Box, Flex, Heading, Image, Text, Spinner } from '@chakra-ui/react'
import { useAuth, useApi } from 'hooks'
import { PageTitle } from 'components/PageTitle/PageTitle'
import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

export function Dashboards() {
  const { user } = useAuth()
  const [donorDashboards, setDonorDashboards] = useState()
  const [isLoading, setIsLoading] = useState(true)

  const { data: organizations } = useApi(
    '/organizations/list',
    useMemo(() => ({ type: 'donor' }), [])
  )

  useEffect(() => {
    if (organizations) {
      const donor_dashboards = []
      for (const donor of organizations) {
        const dashboard_users = donor['dashboard_access']
        if (dashboard_users) {
          if (dashboard_users.includes(user.email)) {
            localStorage.setItem('se_dashboard_access', true)
            donor_dashboards.push(donor)
          }
        }
      }
      setDonorDashboards(donor_dashboards)
      setIsLoading(false)
    }
  }, [organizations])

  return (
    <>
      <PageTitle>Dashboards</PageTitle>
      <Flex justifyContent="left" alignItems="center" flexWrap="wrap">
        {isLoading ? (
          <Spinner size="xl" />
        ) : (
          donorDashboards &&
          donorDashboards.map(donor => (
            <Link to={`/dashboards/${donor.id}`} key={donor.id}>
              <Box
                key={donor.name}
                m={4}
                width="300px"
                height="200px"
                boxShadow="md"
                borderRadius="md"
                bg="gray.700"
                color="black"
                animation="fadeIn 1s"
                display="flex"
                alignItems="center"
                flexDirection="column"
                justifyContent="center"
                backgroundColor={'#fff'}
              >
                <Image src={donor.dashboard_logo} borderRadius={20} />
                <Heading size="ms" mb={2} color="black">
                  {donor.name}
                </Heading>
                <Text color="white">{donor.description}</Text>
              </Box>
            </Link>
          ))
        )}
      </Flex>
    </>
  )
}
