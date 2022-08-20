import {
  Box,
  Heading,
  Link as Clink,
  Flex,
  Skeleton,
  Text,
  Button,
} from '@chakra-ui/react'
import { Page } from 'chakra_components'
import { useApi, useIsMobile } from 'hooks'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Error } from 'components'
import { formatPhoneNumber, ORG_TYPE_ICONS, DAYS } from 'helpers'
import { useEffect } from 'react'

export function Organization({ setBreadcrumbs }) {
  const { organization_id } = useParams()
  const navigate = useNavigate()
  const {
    data: organization,
    loading,
    error,
  } = useApi(`/organization/${organization_id}`)

  useEffect(() => {
    organization &&
      setBreadcrumbs([
        { label: 'Organizations', link: '/organizations' },
        { label: organization.name, link: `/organizations/${organization.id}` },
      ])
  }, [organization])

  if (loading && !organization) {
    return <LoadingOrganization />
  } else if (error) {
    return <OrganizationPageError message={error} />
  } else if (!organization) {
    return <OrganizationPageError message="No Organization Found" />
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
        <Heading
          as="h1"
          fontWeight="700"
          size="2xl"
          textTransform="capitalize"
          color="element.primary"
        >
          Organization
        </Heading>
        <Flex align="center" direction="column" w="100%">
          <Text fontSize="6xl" mt={6}>
            {ORG_TYPE_ICONS[organization.subtype]}
          </Text>
          <Text fontWeight={700}>{organization.name}</Text>
          <Text textTransform="capitalize">
            {organization.type} ({organization.subtype})
          </Text>
          <Button
            variant="secondary"
            mt={4}
            onClick={() => navigate(`/organizations/${organization_id}/edit`)}
          >
            Edit Organization
          </Button>
        </Flex>
        <Text fontWeight={700} fontSize="lg" mb={4} mt={8}>
          Locations
        </Text>
        {organization.locations.map((location, i) => (
          <Box key={i}>
            <Text fontWeight={600}>{location.address1}</Text>
            <Link
              to={`/organizations/${organization_id}/locations/${location?.id}`}
            >
              <Text fontWeight={600}>
                {location.city}, {location.state} {location.zip}
              </Text>
            </Link>
            <Clink
              href={`tel:+${location.contact_phone}`}
              color="element.active"
              textDecoration="underline"
            >
              {formatPhoneNumber(location.contact_phone)}
            </Clink>
          </Box>
        ))}

        <Text fontWeight={700} fontSize="lg" my={4}>
          Open Hours
        </Text>
        {organization.locations?.map((location, i) => (
          <Box key={i}>
            {location.hours?.map((hour, i) => (
              <Box>
                <Text color="element.secondary">
                  {DAYS[hour.day_of_week]}:{' '}
                  <Text as="span" fontWeight={300}>
                    {hour.time_open} - {hour.time_close}
                  </Text>
                </Text>
              </Box>
            ))}
          </Box>
        ))}
      </>
    )
}

function LoadingOrganization({}) {
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
          Loading Organization...
        </Heading>
        <Skeleton h="320px" mt={isMobile ? '64px' : 0} />
        <Text as="h2" fontWeight={700} size="lg" textTransform="capitalize">
          Locations
        </Text>
        <Skeleton h="32" my="4" />
        <Text as="h2" fontWeight={700} size="lg" textTransform="capitalize">
          Open Hours
        </Text>
        <Skeleton h="32" my="4" />
      </Box>
    </>
  )
}

function OrganizationPageError({ message }) {
  return <Error message={message} />
}
