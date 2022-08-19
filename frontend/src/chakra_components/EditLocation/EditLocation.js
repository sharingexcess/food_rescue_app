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
import { MapLocation, Page } from 'chakra_components'
import { useApi, useIsMobile } from 'hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { Error, GoogleMap } from 'components'
import { formatPhoneNumber, DAYS } from 'helpers'
import { useState } from 'react'

export function EditLocation() {
  const { organization_id, location_id } = useParams()
  const navigate = useNavigate()
  const {
    data: organization,
    loading,
    error,
    refresh,
  } = useApi(`/organization/${organization_id}`)

  // console.log('org', organization)
  const locations = organization?.locations
  const location = locations?.filter(i => i.id === location_id)[0]
  // console.log('loc', location)

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

  function isFormDataValid() {
    if (!formData.lat || !formData.lng) {
      window.alert('Address is not complete!')
    }
    return true
  }

  async function handleSubmit() {
    if (isFormDataValid()) {
      try {
        const new_location_id =
          location_id || (await generateUniqueId('locations'))
        await setFirestoreData(['locations', new_location_id], {
          id: new_location_id,
          organization_id,
          ...formData,
          hours: checkMonToFriday(),
          contact_phone: removeSpecialCharacters(formData.contact_phone || ''),
          timestamp_created: location.timestamp_created || createTimestamp(),
          timestamp_updated: createTimestamp(),
        })
        navigate(`/admin/organizations/${organization_id}`)
      } catch (e) {
        console.error('Error writing document: ', e)
      }
    }
  }

  function EditLocationPageWrapper({ children }) {
    return (
      <Page
        id="EditLocation"
        title="Edit Location"
        breadcrumbs={[
          { label: 'Organizations', link: '/chakra/organizations' },
          {
            label: 'Organization',
            link: `/chakra/organizations/${organization_id}`,
          },
          {
            label: 'Location',
            link: `/chakra/organizations/${organization_id}/locations/${location_id}`,
          },
        ]}
      >
        {children}
      </Page>
    )
  }

  if (loading && !organization) {
    return (
      <LoadingEditLocation EditLocationPageWrapper={EditLocationPageWrapper} />
    )
  } else if (error) {
    return (
      <EditLocationPageError
        EditLocationPageWrapper={EditLocationPageWrapper}
        message={error}
      />
    )
  } else if (!organization) {
    return (
      <EditLocationPageError
        EditLocationPageWrapper={EditLocationPageWrapper}
        message="No EditLocation Found"
      />
    )
  } else
    return (
      <EditLocationPageWrapper>
        <Flex
          bgGradient="linear(to-b, transparent, surface.background)"
          h="32"
          mt="-32"
          zIndex={1}
          position="relative"
          direction="column"
          justify="flex-end"
        />
        <Flex direction="column">
          {formData.lat && formData.lng ? (
            <MapLocation lat={formData.lat} lng={formData.lng} />
          ) : null}
        </Flex>
        <Heading
          as="h1"
          fontWeight="700"
          size="2xl"
          textTransform="capitalize"
          color="element.primary"
          mb={4}
        >
          Edit Location
        </Heading>
        <Flex justify="start" gap={4} align="start" mb={8}>
          <Text fontSize="20px">📍</Text>
          <Box>
            <Text fontWeight={600}>{location.address1}</Text>
            <Text fontWeight={600}>
              {location.city}, {location.state} {location.zip}
            </Text>
            <Link
              href={`tel:+${location.contact_phone}`}
              color="element.active"
              textDecoration="underline"
            >
              {formatPhoneNumber(location.contact_phone)}
            </Link>
          </Box>
          <CloseIcon color="element.error" ml="auto" />
        </Flex>
        <Flex align="start" direction="column" w="100%">
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
      </EditLocationPageWrapper>
    )
}

function LoadingEditLocation({ EditLocationPageWrapper }) {
  const isMobile = useIsMobile()
  return (
    <EditLocationPageWrapper>
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
          Loading EditLocation...
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
    </EditLocationPageWrapper>
  )
}

function EditLocationPageError({ EditLocationPageWrapper, message }) {
  return (
    <EditLocationPageWrapper>
      <Error message={message} />
    </EditLocationPageWrapper>
  )
}
