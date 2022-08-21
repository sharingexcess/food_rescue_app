import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Select,
  Text,
} from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'
import { MapLocation, AddressAutocomplete, FormField } from 'chakra_components'
import { useApi, useAuth, useIsMobile } from 'hooks'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DAYS,
  SE_API,
  removeSpecialCharacters,
  createTimestamp,
  generateUniqueId,
  TIMES,
} from 'helpers'
import { useEffect, useState } from 'react'

export function CreateLocation({ setBreadcrumbs }) {
  const { organization_id } = useParams()
  const navigate = useNavigate()
  const { data: organization } = useApi(`/organization/${organization_id}`)
  const isMobile = useIsMobile()
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    address1: '',
    address2: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
    nickname: '',
    hours: [],
  })

  useEffect(() => {
    organization &&
      setBreadcrumbs([
        { label: 'Organizations', link: '/organizations' },
        { label: organization.name, link: `/organizations/${organization.id}` },
        {
          label: 'Create Location',
          link: `/organizations/${organization.id}/create-location`,
        },
      ])
  }, [organization])

  const FIELDS = [
    {
      id: 'nickname',
      title: 'Location Nickname',
      isOptional: true,
      isValid: true,
    },
    {
      id: 'address2',
      title: 'Apartment/Suite Number',
      isOptional: true,
      isValid: true,
    },
    {
      id: 'contact_name',
      title: 'Contact Name',
      isValid: true,
    },
    {
      id: 'contact_email',
      title: 'Contact Email',
      isValid: true,
    },
    {
      id: 'contact_phone',
      type: 'tel',
      title: 'Phone Number',
      isValid: formData.contact_phone.length > 9,
    },
    {
      id: 'notes',
      title: 'Notes/Instructions',
      isValid: true,
    },
  ]

  const isFormComplete = (() => {
    let result = true
    for (const field of FIELDS) {
      if (!field.isValid) {
        result = false
        break
      }
    }
    return result
  })()

  function handleReceiveAddress(address) {
    setFormData(prevData => ({ ...prevData, ...address }))
  }

  async function handleSubmit() {
    setIsLoading(true)
    try {
      const location_id = await generateUniqueId('locations')
      await SE_API.post(
        `/location/${location_id}/update`,
        {
          id: location_id,
          organization_id,
          ...formData,
          contact_phone: removeSpecialCharacters(formData.contact_phone || ''),
          hours: checkMonToFriday(),
          timestamp_created: createTimestamp(),
          timestamp_updated: createTimestamp(),
        },
        user.accessToken
      )
      navigate(`/organizations/${organization_id}`)
    } catch (e) {
      console.error('Error writing document: ', e)
    }
    setIsLoading(false)
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

  return (
    <>
      <Heading
        as="h1"
        fontWeight="700"
        size="2xl"
        textTransform="capitalize"
        color="element.primary"
      >
        Create Location
      </Heading>
      {formData.address1 ? (
        <>
          <Box h="8" />
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

            {FIELDS.map(i => (
              <FormField
                id={i.id}
                key={i.id}
                title={i.title}
                isValid={i.isValid}
                isOptional={i.isOptional}
                formData={formData}
                setFormData={setFormData}
              />
            ))}

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

            <Button
              size="lg"
              position={isMobile ? 'fixed' : 'relative'}
              w={isMobile ? 'calc(100% - 32px)' : null}
              bottom={isMobile ? '4' : null}
              left={isMobile ? '4' : null}
              loadingText="Saving Location..."
              zIndex="8"
              mt="4"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!isFormComplete}
            >
              Save New Location
            </Button>
          </Flex>
          <Box h="24" />
        </>
      ) : (
        <>
          <Text color="element.secondary" my="4" fontSize="sm">
            Select an address below using the Google Maps Autocomplete to being
            creating a new location.
          </Text>
          <AddressAutocomplete handleSelect={handleReceiveAddress} />
        </>
      )}
    </>
  )
}
