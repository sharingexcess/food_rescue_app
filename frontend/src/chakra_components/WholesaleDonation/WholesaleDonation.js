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
} from '@chakra-ui/react'
import { useApi, useIsMobile } from 'hooks'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export function WholesaleDonation({ setBreadcrumbs }) {
  const { id } = useParams()
  const isMobile = useIsMobile()
  const { data: rescue } = useApi(`/rescues/${id}`)

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
      <Heading
        as="h1"
        fontWeight="700"
        size="2xl"
        textTransform="capitalize"
        color="element.primary"
        mb="8"
      >
        Donation
      </Heading>
      <Flex my="6" direction="column">
        <Flex justify="space-between" align="center">
          <Heading as="h2" size="md" fontWeight="600" color="element.primary">
            {donation.organization.name}
          </Heading>
          <Button variant="tertiary">Edit Donation</Button>
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
      <Flex direction="column">
        <Button variant="secondary" mt="8" w={isMobile ? '100%' : 'auto'}>
          Add Recipient ({remainingWeight} lbs. remaining)
        </Button>
        <Button
          size="lg"
          w={isMobile ? 'calc(100% - 32px)' : 'auto'}
          position={isMobile ? 'fixed' : 'relative'}
          mt="4"
          left={isMobile ? '4' : 'unset'}
          bottom={isMobile ? '4' : 'unset'}
        >
          Update Donation
        </Button>
      </Flex>
    </>
  )
}

function Recipient({ recipient }) {
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
      <IconButton variant="ghosted" icon={<EditIcon w="6" h="6" />} />
    </Flex>
  )
}

function LoadingDonation() {
  const { id } = useParams()

  return (
    <>
      <Heading
        as="h1"
        fontWeight="700"
        size="2xl"
        textTransform="capitalize"
        color="element.primary"
        mb="8"
      >
        Loading Donation...
      </Heading>
      <Skeleton w="100%" h="32" my="4" />
      <Skeleton w="100%" h="32" my="4" />
      <Skeleton w="100%" h="32" my="4" />
      <Skeleton w="100%" h="32" my="4" />
    </>
  )
}
