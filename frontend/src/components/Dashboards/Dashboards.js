import { Box, Flex, Heading, Image, Spinner } from '@chakra-ui/react'
import { useAuth, useApi, useIsMobile } from 'hooks'
import { PageTitle } from 'components/PageTitle/PageTitle'
import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

export function Dashboards() {
  const { user } = useAuth()
  const [donorDashboards, setDonorDashboards] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useIsMobile()

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
      <Flex
        justifyContent={isMobile ? 'center' : 'left'}
        alignItems="center"
        flexWrap="wrap"
      >
        <Link to="/dashboards/cities">
          <Box
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
            <Image
              src="/usa.png"
              borderRadius={20}
              maxWidth="100%"
              maxHeight="70%"
              objectFit="cover"
            />
            <Heading size="ms" mb={2} color="black">
              Cities & States Impact
            </Heading>
          </Box>
        </Link>
        {isLoading ? (
          <Spinner size="xl" />
        ) : (
          donorDashboards &&
          donorDashboards.map(donor => (
            <Link to={`/dashboards/${donor.id}`} key={donor.id}>
              <Box
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
                <Image
                  src={donor.dashboard_logo ? donor.dashboard_logo : ''}
                  borderRadius={20}
                  maxWidth="100%"
                  maxHeight="60%"
                  objectFit="cover"
                />
                <Heading size="ms" mb={2} color="black">
                  {donor.name}
                </Heading>
              </Box>
            </Link>
          ))
        )}
      </Flex>
    </>
  )
}
