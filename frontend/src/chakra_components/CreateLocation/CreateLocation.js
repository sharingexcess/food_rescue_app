import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Link,
  Select,
  Skeleton,
  Text,
} from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'
import { Directions, Page } from 'chakra_components'
import { useApi, useIsMobile } from 'hooks'
import { useParams } from 'react-router-dom'
import { Error, GoogleMap } from 'components'
import { formatPhoneNumber, DAYS } from 'helpers'
import { useState } from 'react'

export function CreateLocation() {
  const { organization_id, location_id } = useParams()
  const {
    data: organization,
    loading,
    error,
    refresh,
  } = useApi(`/organization/${organization_id}`)

  const [formData, setFormData] = useState({
    address1: '',
    address2: '',
    apartment_number: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
    nickname: '',
    hours: [],
    is_philabundance_partner: false,
  })

  const [day, setDay] = useState('')
  const [openTime, setOpenTime] = useState('')
  const [closeTime, setCloseTime] = useState('')

  function handleChange(e) {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  function CreateLocationPageWrapper({ children }) {
    return (
      <Page
        id="CreateLocation"
        title="Create Location"
        breadcrumbs={[
          { label: 'Organizations', link: '/chakra/organizations' },
          {
            label: 'Organization',
            link: `/chakra/organizations/${organization_id}`,
          },
          {
            label: 'Create Org',
            link: `/chakra/organizations/${organization_id}/locations/`,
          },
        ]}
      >
        {children}
      </Page>
    )
  }

  if (loading && !organization) {
    return (
      <LoadingCreateLocation
        CreateLocationPageWrapper={CreateLocationPageWrapper}
      />
    )
  } else if (error) {
    return (
      <CreateLocationPageError
        CreateLocationPageWrapper={CreateLocationPageWrapper}
        message={error}
      />
    )
  } else if (!organization) {
    return (
      <CreateLocationPageError
        CreateLocationPageWrapper={CreateLocationPageWrapper}
        message="No CreateLocation Found"
      />
    )
  } else
    return (
      <CreateLocationPageWrapper>
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
          mb={4}
        >
          CreateLocation
        </Heading>

        <Flex align="start" direction="column" w="100%">
          <Text fontWeight={400}>Address</Text>
          <Input
            id="apartmentNumber"
            value={formData.apartment_number}
            onChange={e => handleChange(e)}
            placeholder="Location..."
            variant="flushed"
            mb={4}
          />
          <Text fontWeight={400}>Apartment Number (optional)</Text>
          <Input
            id="apartmentNumber"
            value={formData.apartment_number}
            onChange={e => handleChange(e)}
            variant="flushed"
            mb={4}
          />
          <Text fontWeight={400}>Contact Name</Text>
          <Input
            id="contactName"
            value={formData.contact_name}
            onChange={e => handleChange(e)}
            variant="flushed"
            mb={4}
          />
          <Text fontWeight={400}>Contact Email</Text>
          <Input
            id="contactEmail"
            value={formData.contact_email}
            onChange={e => handleChange(e)}
            variant="flushed"
            mb={4}
          />
          <Text fontWeight={400}>Phone Number</Text>
          <Input
            id="phoneNumber"
            value={formData.contact_phone}
            onChange={e => handleChange(e)}
            variant="flushed"
            mb={4}
          />
          <Text fontWeight={400}>Location Nickname (optional)</Text>
          <Input
            id="nickname"
            value={formData.nickname}
            onChange={e => handleChange(e)}
            variant="flushed"
            mb={4}
          />
          <Text fontWeight={400}>Notes + Instructions</Text>
          <Input
            id="notes"
            value={formData.notes}
            onChange={e => handleChange(e)}
            variant="flushed"
            mb={4}
          />
          <Flex
            justify="space-between"
            flexWrap={['wrap', 'wrap', 'nowrap', 'nowrap', 'nowrap']}
            gap="1"
            mb="8"
            w="100%"
          >
            <Select
              variant="flushed"
              onChange={e => setDay(e.target.value)}
              value={day}
              flexGrow="0.2"
              flexBasis={['30%', '30%', '180px', '180px', '180px']}
              fontSize="12px"
              color="element.secondary"
            >
              <option value="">Day Of Week</option>
              {DAYS.map((day, i) => (
                <option key={i} value={day}>
                  {day}
                </option>
              ))}
            </Select>

            <Select
              variant="flushed"
              onChange={e => setOpenTime(e.target.value)}
              value={openTime}
              flexGrow="0.2"
              flexBasis={['30%', '30%', '180px', '180px', '180px']}
              fontSize="12px"
              color="element.secondary"
            >
              <option value="">Open Time</option>
              {DAYS.map((day, i) => (
                <option key={i} value={day}>
                  {day}
                </option>
              ))}
            </Select>

            <Select
              variant="flushed"
              onChange={e => setCloseTime(e.target.value)}
              value={closeTime}
              flexGrow="0.2"
              flexBasis={['30%', '30%', '180px', '180px', '180px']}
              fontSize="12px"
              color="element.secondary"
            >
              <option value="">Close Time</option>
              {DAYS.map((day, i) => (
                <option key={i} value={day}>
                  {day}
                </option>
              ))}
            </Select>
          </Flex>
          <Button
            alignSelf="center"
            variant="secondary"
            mt={8}
            disabled={day === '' || openTime === '' || closeTime === ''}
          >
            Add Hours
          </Button>
          <Flex justify="space-between" w="100%" mt={6}>
            <Button alignSelf="center" variant="primary" mt={4}>
              Save Location
            </Button>
            <Button
              alignSelf="center"
              variant="primary"
              color="element.warning"
              mt={4}
            >
              Delete Location
            </Button>
          </Flex>
        </Flex>
      </CreateLocationPageWrapper>
    )
}

function LoadingCreateLocation({ CreateLocationPageWrapper }) {
  const isMobile = useIsMobile()
  return (
    <CreateLocationPageWrapper>
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
          Loading CreateLocation...
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
    </CreateLocationPageWrapper>
  )
}

function CreateLocationPageError({ CreateLocationPageWrapper, message }) {
  return (
    <CreateLocationPageWrapper>
      <Error message={message} />
    </CreateLocationPageWrapper>
  )
}
