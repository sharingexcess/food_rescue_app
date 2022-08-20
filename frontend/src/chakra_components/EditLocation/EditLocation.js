import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
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
import { Error } from 'components'
import { formatPhoneNumber, DAYS } from 'helpers'
import { useEffect, useState } from 'react'

export function EditLocation({ setBreadcrumbs }) {
  const { organization_id, location_id } = useParams()
  const navigate = useNavigate()
  const {
    data: organization,
    loading,
    error,
  } = useApi(`/organization/${organization_id}`)

  const locations = organization?.locations
  const location = locations?.filter(i => i.id === location_id)[0]

  const [formData, setFormData] = useState()
  const [day, setDay] = useState('')
  const [openTime, setOpenTime] = useState('')
  const [closeTime, setCloseTime] = useState('')

  useEffect(() => {
    if (organization) {
      setBreadcrumbs([
        { label: 'Organizations', link: '/organizations' },
        {
          label: organization.name,
          link: `/organizations/${organization.id}`,
        },
        {
          label: location.nickname || location.address1,
          link: `/organizations/${organization_id}/locations/${location_id}`,
        },
      ])
    }
  }, [organization])

  useEffect(() => {
    if (location) {
      setFormData({
        address1: location.address1 || '',
        address2: location.address2 || '',
        city: location.city || '',
        state: location.state || '',
        zip: location.zip || '',
        contact_name: location.contact_name || '',
        contact_email: location.contact_email || '',
        contact_phone: location.contact_phone || '',
        notes: location.notes || '',
        nickname: location.nickname || '',
        hours: location.hours || [],
        lat: location.lat,
        lng: location.lng,
      })
    }
  }, [location])

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
        navigate(`/organizations/${organization_id}`)
      } catch (e) {
        console.error('Error writing document: ', e)
      }
    }
  }

  if (loading && !formData) {
    return <LoadingEditLocation />
  } else if (error) {
    return <EditLocationPageError message={error} />
  } else if (!formData) {
    return <EditLocationPageError message="No Location Found" />
  } else
    return (
      <>
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
        <MapLocation lat={formData.lat} lng={formData.lng} />
        <Flex align="start" direction="column" w="100%">
          <Flex justify="start" gap="4" align="start" py="8" w="100%">
            <Box>
              <Heading size="lg" fontWeight="600">
                {formData.address1}
              </Heading>
              <Heading size="md" color="element.secondary" fontWeight="300">
                {formData.city}, {formData.state} {formData.zip}
              </Heading>
            </Box>
            <IconButton
              icon={<CloseIcon color="element.tertiary" />}
              onClick={() => setFormData({ ...formData, address1: '' })}
              variant="tertiary"
              ml="auto"
            />
          </Flex>
        </Flex>
        <Flex align="start" direction="column" w="100%">
          <Text fontWeight={400}>Location Nickname (optional)</Text>
          <Input
            id="nickname"
            value={formData.nickname}
            onChange={e => handleChange(e)}
            mb={4}
          />

          <Text fontWeight={400}>Apartment Number (optional)</Text>
          <Input
            id="address2"
            value={formData.address2}
            onChange={e => handleChange(e)}
            mb={4}
          />

          <Text fontWeight={400}>Contact Name</Text>
          <Input
            id="contact_name"
            value={formData.contact_name}
            onChange={e => handleChange(e)}
            mb={4}
          />

          <Text fontWeight={400}>Contact Email</Text>
          <Input
            id="contact_email"
            value={formData.contact_email}
            onChange={e => handleChange(e)}
            mb={4}
          />

          <Text fontWeight={400}>Phone Number</Text>
          <Input
            id="contact_phone"
            value={formData.contact_phone}
            onChange={e => handleChange(e)}
            mb={4}
          />

          <Text fontWeight={400}>Notes + Instructions</Text>
          <Input
            id="notes"
            value={formData.notes}
            onChange={e => handleChange(e)}
            mb={4}
          />

          <Text fontWeight="700">Open Hours</Text>
          <Flex
            justify="space-between"
            flexWrap={['wrap', 'wrap', 'nowrap', 'nowrap', 'nowrap']}
            gap="1"
            mb="8"
            w="100%"
          >
            <Select
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
      </>
    )
}

function LoadingEditLocation({}) {
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
          Loading Location...
        </Heading>
        <Skeleton h="320px" mt={isMobile ? '64px' : 0} />
        <Text as="h2" fontWeight="700" size="lg" textTransform="capitalize">
          Locations
        </Text>
        <Skeleton h="32" my="4" />
        <Text as="h2" fontWeight="700" size="lg" textTransform="capitalize">
          Open Hours
        </Text>
        <Skeleton h="32" my="4" />
      </Box>
    </>
  )
}

function EditLocationPageError({ message }) {
  return <Error message={message} />
}
