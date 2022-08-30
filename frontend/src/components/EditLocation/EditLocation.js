import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Select,
  Skeleton,
  Text,
} from '@chakra-ui/react'
import { CloseIcon, DeleteIcon } from '@chakra-ui/icons'
import {
  MapLocation,
  AddressAutocomplete,
  FormField,
  PageTitle,
  Error,
  FooterButton,
} from 'components'
import { useApi, useAuth, useIsMobile } from 'hooks'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DAYS,
  SE_API,
  removeSpecialCharacters,
  createTimestamp,
  TIMES,
} from 'helpers'
import { useEffect, useState } from 'react'

export function EditLocation({ setBreadcrumbs }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { organization_id, location_id } = useParams()
  const {
    data: organization,
    loading,
    error,
  } = useApi(`/organization/${organization_id}`)

  const locations = organization?.locations
  const location = locations?.filter(i => i.id === location_id)[0]
  const [isLoading, setIsLoading] = useState(false)
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
        {
          label: organization.name,
          link: `/organizations/${organization.id}`,
        },
        {
          label: location.nickname || location.address1,
          link: `/organizations/${organization_id}/locations/${location_id}`,
        },
      ])
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

  function isFormDataValid() {
    if (!formData.lat || !formData.lng) {
      window.alert('Address is not complete!')
    }
    return true
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

  async function handleDelete() {
    if (
      window.confirm(`Are you sure you want to delete ${location.address1}?`)
    ) {
      if (
        window.confirm(`You're SURE??? Deleting a location can't be undone.`)
      ) {
        await SE_API.post(`/location/${location_id}/delete`, user.accessToken)
        navigate(`/organizations/${organization_id}`)
      }
    }
  }

  async function handleSubmit() {
    setIsLoading(true)
    const unrepeatedhours = []
    for (let i = 0; i <= 7; i++) {
      unrepeatedhours.push({
        day_of_week: i,
        time_open: null,
        time_close: null,
      })
    }

    for (const hour of formData.hours) {
      if (hour.day_of_week === 7) {
        checkMonToFriday()
      }
    }
    for (const hour of formData.hours) {
      unrepeatedhours[hour.day_of_week] = {
        ...unrepeatedhours[hour.day_of_week],
        time_open: hour.time_open,
        time_close: hour.time_close,
      }
    }

    const populatedHours = unrepeatedhours.filter(
      hour => hour.time_open !== null && hour.time_close !== null
    )

    setFormData({
      ...formData,
      hours: unrepeatedhours.filter(hour => hour.time_open && hour.time_close),
    })

    if (isFormDataValid()) {
      try {
        await SE_API.post(
          `/location/${location_id}/update`,
          {
            id: location_id,
            organization_id,
            ...formData,
            contact_phone: removeSpecialCharacters(
              formData.contact_phone || ''
            ),
            hours: populatedHours,
            timestamp_created: createTimestamp(),
            timestamp_updated: createTimestamp(),
          },
          user.accessToken
        )
        navigate(`/organizations/${organization_id}`)
      } catch (e) {
        console.error('Error writing document: ', e)
      }
    }
    setIsLoading(false)
  }

  function handleReceiveAddress(address) {
    setFormData(prevData => ({ ...prevData, ...address }))
  }

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
      isValid: formData?.contact_phone?.length > 9,
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

  if (loading && !location) {
    return <LoadingEditLocation />
  } else if (error) {
    return <EditLocationPageError message={error} />
  } else if (!formData) {
    return <EditLocationPageError message="No Location Found" />
  } else
    return (
      <Box pb={24}>
        <Flex justify="space-between" align="center">
          <PageTitle m="0">Edit Location</PageTitle>
          <IconButton
            variant="ghosted"
            onClick={handleDelete}
            icon={<DeleteIcon color="element.tertiary" w="4" h="4" />}
          />
        </Flex>
        {formData.address1 ? (
          <Flex direction="column">
            <SetDetails
              formData={formData}
              setFormData={setFormData}
              isLoading={isLoading}
              handleSubmit={handleSubmit}
              FIELDS={FIELDS}
            />
            <SetHours
              formData={formData}
              setFormData={setFormData}
              handleChangeTimeSlot={handleChangeTimeSlot}
            />
            <FooterButton
              loadingText="Saving Location..."
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!isFormComplete || isLoading}
            >
              Update Location
            </FooterButton>
          </Flex>
        ) : (
          <Box mb="8">
            <Text color="element.secondary" mb="4" fontSize="sm">
              Select an address below using the Google Maps Autocomplete to
              being creating a new location.
            </Text>
            <Text fontWeight="400">Address</Text>
            <AddressAutocomplete handleSelect={handleReceiveAddress} />
          </Box>
        )}
      </Box>
    )
}

function LoadingEditLocation() {
  const isMobile = useIsMobile()
  return (
    <>
      <Box px="4">
        <PageTitle>Loading Location...</PageTitle>
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

function SetDetails({ formData, setFormData, FIELDS }) {
  return (
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
      </Flex>
      <Box h="24" />
    </>
  )
}

function Hours({ dayOfWeek, openTime, closeTime, handleChangeTimeSlot }) {
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
        onChange={e => handleChangeTimeSlot(dayOfWeek, openTime, closeTime, e)}
        value={dayOfWeek}
        flexGrow="0.2"
        flexBasis={['30%', '30%', '180px', '180px', '180px']}
        fontSize="12px"
        color="element.secondary"
      >
        <option value={-1}>Day Of Week</option>
        {DAYS.map((day, i) => (
          <option key={i} value={i}>
            {day}
          </option>
        ))}
      </Select>

      <Select
        id="time_open"
        onChange={e => handleChangeTimeSlot(dayOfWeek, openTime, closeTime, e)}
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
        onChange={e => handleChangeTimeSlot(dayOfWeek, openTime, closeTime, e)}
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

function SetHours({ formData, setFormData, handleChangeTimeSlot }) {
  return (
    <Flex direction="column">
      {formData.hours && <Text fontWeight={700}>Open Hours</Text>}
      {formData.hours.map((hour, index) => {
        return (
          <Hours
            dayOfWeek={hour.day_of_week}
            openTime={hour.time_open}
            closeTime={hour.time_close}
            key={index}
            handleChangeTimeSlot={handleChangeTimeSlot}
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
    </Flex>
  )
}
