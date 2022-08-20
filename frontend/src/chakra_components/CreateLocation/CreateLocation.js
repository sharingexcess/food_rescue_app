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
import { Page, MapLocation } from 'chakra_components'
import { useApi, useIsMobile } from 'hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { Error, GoogleAutoComplete, GoogleMap } from 'components'
import {
  formatPhoneNumber,
  DAYS,
  SE_API,
  removeSpecialCharacters,
  createTimestamp,
  generateUniqueId,
  TIMES,
} from 'helpers'
import { useState } from 'react'

export function CreateLocation({ setBreadcrumbs }) {
  const { organization_id } = useParams()
  const navigate = useNavigate()
  const {
    data: organization,
    loading,
    error,
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

  function handleChange(e) {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  function isFormDataValid() {
    if (!formData.lat || !formData.lng) {
      window.alert('Address is not complete!')
    }
    return true
  }

  function handleReceiveAddress(address) {
    setFormData(prevData => ({ ...prevData, ...address }))
  }

  async function handleSubmit() {
    if (isFormDataValid()) {
      try {
        const location_id = await generateUniqueId('locations')
        await SE_API.post(`location/${location_id}/update`, {
          id: location_id,
          organization_id,
          ...formData,
          contact_phone: removeSpecialCharacters(formData.contact_phone || ''),
          hours: checkMonToFriday(),
          timestamp_created: createTimestamp(),
          timestamp_updated: createTimestamp(),
        })
        navigate(`/organizations/${organization_id}`)
      } catch (e) {
        console.error('Error writing document: ', e)
      }
    }
  }

  function checkMonToFriday() {
    const indexOfMonFriday = formData.hours.findIndex(
      hour => hour.day_of_week === 7
    )
    if (indexOfMonFriday !== -1) {
      const open = formData.hours[indexOfMonFriday].time_open
      const close = formData.hours[indexOfMonFriday].time_close
      const hours = []
      setFormData({
        ...formData,
        hours: formData.hours.splice(indexOfMonFriday, 1),
      })
      for (let i = 1; i <= 5; i++) {
        hours.push({
          day_of_week: i,
          time_open: open,
          time_close: close,
        })
      }
      const newHours = formData.hours.concat(hours)
      return newHours
    }
    return formData.hours
  }

  function handleChangeTimeSlot(day, open, close, e) {
    const alter = formData.hours
      ? formData.hours.findIndex(
          hour =>
            hour.day_of_week === day &&
            hour.time_open === open &&
            hour.time_close === close
        )
      : 0
    if (e) {
      setFormData({
        ...formData,
        hours: formData.hours.map((hour, index) =>
          index === alter
            ? e.target.id === 'day_of_week'
              ? { ...hour, [e.target.id]: parseInt(e.target.value) }
              : { ...hour, [e.target.id]: e.target.value }
            : hour
        ),
      })
    } else {
      setFormData({
        ...formData,
        hours: formData.hours.filter((element, index) => index !== alter),
      })
    }
  }

  function CreateLocationPageWrapper({ children }) {
    return (
      <Page
        id="CreateLocation"
        title="Create Location"
        breadcrumbs={[
          { label: 'Organizations', link: '/organizations' },
          {
            label: 'Organization',
            link: `/organizations/${organization_id}`,
          },
          {
            label: 'Location',
            link: `/organizations/${organization_id}/locations/`,
          },
        ]}
      >
        {children}
      </Page>
    )
  }

  function Hours({ dayOfWeek, openTime, closeTime }) {
    return (
      <Flex
        justify="space-between"
        flexWrap={['wrap', 'wrap', 'nowrap', 'nowrap', 'nowrap']}
        gap="1"
        mb="8"
        w="100%"
      >
        <Select
          variant="flushed"
          id="day_of_week"
          onChange={e =>
            handleChangeTimeSlot(dayOfWeek, openTime, closeTime, e)
          }
          value={dayOfWeek}
          flexGrow="0.2"
          flexBasis={['30%', '30%', '180px', '180px', '180px']}
          fontSize="12px"
          color="element.secondary"
        >
          <option value={0}>Day Of Week</option>
          {DAYS.map((day, i) => (
            <option key={i} value={i}>
              {day}
            </option>
          ))}
        </Select>

        <Select
          variant="flushed"
          id="time_open"
          onChange={e =>
            handleChangeTimeSlot(dayOfWeek, openTime, closeTime, e)
          }
          value={openTime}
          flexGrow="0.2"
          flexBasis={['30%', '30%', '180px', '180px', '180px']}
          fontSize="12px"
          color="element.secondary"
        >
          <option value="">Open Time</option>
          {TIMES.map((time, i) => (
            <option key={i} value={time}>
              {time}
            </option>
          ))}
        </Select>

        <Select
          variant="flushed"
          id="time_close"
          onChange={e =>
            handleChangeTimeSlot(dayOfWeek, openTime, closeTime, e)
          }
          value={closeTime}
          flexGrow="0.2"
          flexBasis={['30%', '30%', '180px', '180px', '180px']}
          fontSize="12px"
          color="element.secondary"
        >
          <option value="">Close Time</option>
          {TIMES.map((time, i) => (
            <option key={i} value={time}>
              {time}
            </option>
          ))}
        </Select>
        <IconButton
          icon={<CloseIcon color="element.error" />}
          onClick={() => handleChangeTimeSlot(dayOfWeek, openTime, closeTime)}
          variant="tertiary"
          ml="auto"
        />
      </Flex>
    )
  }

  if (loading && !organization) {
    return <LoadingCreateLocation />
  } else if (error) {
    return <CreateLocationPageError message={error} />
  } else if (!organization) {
    return <CreateLocationPageError message="No CreateLocation Found" />
  } else
    return (
      <>
        {formData.address1 ? (
          <>
            {formData.lat && formData.lng ? (
              <MapLocation lat={formData.lat} lng={formData.lng} />
            ) : null}
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
              Create Location
            </Heading>
            <Flex align="start" direction="column" w="100%">
              {formData.address1 ? (
                <Flex justify="start" gap={4} align="start" mb={8} w="100%">
                  <Text fontSize="20px">📍</Text>
                  <Box>
                    <Text fontWeight={600}>{formData.address1}</Text>
                    <Text fontWeight={600}>
                      {formData.city}, {formData.state} {formData.zip}
                    </Text>
                    <Link
                      href={`tel:+${formData.contact_phone}`}
                      color="element.active"
                      textDecoration="underline"
                    >
                      {formatPhoneNumber(formData.contact_phone)}
                    </Link>
                  </Box>
                  <IconButton
                    icon={<CloseIcon color="element.error" />}
                    onClick={() => setFormData({ ...formData, address1: '' })}
                    variant="tertiary"
                    ml="auto"
                  />
                </Flex>
              ) : (
                <>
                  <Text fontWeight={400}>Address</Text>
                  <Input
                    id="address1"
                    value={formData.address1}
                    onChange={e => handleChange(e)}
                    placeholder="Location..."
                    variant="flushed"
                    mb={4}
                  />
                </>
              )}

              <Text fontWeight={400}>Apartment Number (optional)</Text>
              <Input
                id="apartment_number"
                value={formData.address2}
                onChange={e => handleChange(e)}
                variant="flushed"
                mb={4}
              />
              <Text fontWeight={400}>Contact Name</Text>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={e => handleChange(e)}
                variant="flushed"
                mb={4}
              />
              <Text fontWeight={400}>Contact Email</Text>
              <Input
                id="contact_email"
                value={formData.contact_email}
                onChange={e => handleChange(e)}
                variant="flushed"
                mb={4}
              />
              <Text fontWeight={400}>Phone Number</Text>
              <Input
                id="contact_phone"
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
              <Text fontWeight={700}>Open Hours</Text>
              {formData.hours.map((hour, index) => {
                return (
                  <Hours
                    dayOfWeek={hour.day_of_week}
                    openTime={hour.time_open}
                    closeTime={hour.time_close}
                    key={index}
                  />
                )
              })}
              <Button
                alignSelf="center"
                variant="secondary"
                mt={8}
                onClick={() => {
                  setFormData({
                    ...formData,
                    hours: [
                      ...formData.hours,
                      {
                        day_of_week: null,
                        time_open: null,
                        time_close: null,
                      },
                    ],
                  })
                }}
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
        ) : (
          <GoogleAutoComplete handleSelect={handleReceiveAddress} />
        )}
      </>
    )
}

function LoadingCreateLocation() {
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
    </>
  )
}

function CreateLocationPageError({ message }) {
  return <Error message={message} />
}
