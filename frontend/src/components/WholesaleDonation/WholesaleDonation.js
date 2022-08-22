import { EditIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Skeleton,
  Text,
  useToast,
} from '@chakra-ui/react'
import { PageTitle, FooterButton } from 'components'
import { useApi, useAuth, useIsMobile } from 'hooks'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export function WholesaleDonation({ setBreadcrumbs }) {
  const { id } = useParams()
  const isMobile = useIsMobile()
  const { data: rescue } = useApi(`/rescues/${id}`)
  const { hasAdminPermission } = useAuth()
  const toast = useToast()

  useEffect(() => {
    toast({
      title: 'Work In Progress...',
      description: `This section of the app is still under construction. Feel free to take a peak, but you can expect for less than 100% functionality.`,
      isClosable: true,
      position: 'top',
    })
  }, [])

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Wholesale', link: '/wholesale' },
      { label: 'Donation', link: `/wholesale/${id}` },
    ])
  }, [id])

  if (!rescue) return <LoadingDonation />

  const donation = rescue.stops[0]
  const recipients = rescue.stops.slice(1)
  const remainingWeight =
    donation.impact_data_total_weight -
    recipients.reduce((total, curr) => total + curr.impact_data_total_weight, 0)

  return (
    <>
      <PageTitle>Donation</PageTitle>
      <Flex my="6" direction="column">
        <Flex justify="space-between" align="center">
          <Heading as="h2" size="md" fontWeight="600" color="element.primary">
            {donation.organization.name}
          </Heading>

          {hasAdminPermission && (
            <Button variant="tertiary">Edit Donation</Button>
          )}
        </Flex>
        <Text size="sm" fontWeight="300" color="element.secondary">
          {donation.impact_data_total_weight} lbs.&nbsp;&nbsp;|&nbsp;&nbsp;
          {donation.notes}
        </Text>
      </Flex>
      <Divider />
      {recipients.map(i => (
        <Recipient key={i.id} recipient={i} />
      ))}

      {hasAdminPermission && (
        <Flex direction="column">
          <Button variant="secondary" mt="8" w={isMobile ? '100%' : 'auto'}>
            Add Recipient ({remainingWeight} lbs. remaining)
          </Button>
          <FooterButton>Update Donation</FooterButton>
        </Flex>
      )}
    </>
  )
}

function Recipient({ recipient }) {
  const { hasAdminPermission } = useAuth()
  return (
    <Flex w="100%" justify="space-between" align="center" py="4">
      <Box>
        <Heading
          as="h6"
          fontWeight="600"
          letterSpacing={1}
          fontSize="sm"
          color="element.tertiary"
          textTransform="uppercase"
          py="2"
        >
          RECIPIENT&nbsp;&nbsp;|&nbsp;&nbsp;
          <Text as="span" color="se.brand.primary">
            {recipient.impact_data_total_weight} lbs.
          </Text>
        </Heading>
        <Heading as="h4" size="md" fontWeight="600" color="element.primary">
          {recipient.organization.name}
        </Heading>
        <Text size="sm" fontWeight="300" color="element.secondary">
          {recipient.location.nickname || recipient.location.address1}
        </Text>
      </Box>

      {hasAdminPermission && (
        <IconButton variant="ghosted" icon={<EditIcon w="6" h="6" />} />
      )}
    </Flex>
  )
}

function LoadingDonation() {
  return (
    <>
      <PageTitle>Loading Donation...</PageTitle>
      <Skeleton w="100%" h="32" my="4" />
      <Skeleton w="100%" h="32" my="4" />
      <Skeleton w="100%" h="32" my="4" />
      <Skeleton w="100%" h="32" my="4" />
    </>
  )
}
