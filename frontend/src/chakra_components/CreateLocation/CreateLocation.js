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
import { Directions, Page, Location } from 'chakra_components'
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
import { Spacer } from '@sharingexcess/designsystem'
// import { initializeFormData } from './utils'

export function CreateLocation() {
  const { organization_id } = useParams()
  const navigate = useNavigate()
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
            label: 'Location',
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
      // <CreateLocationPageWrapper>
      // <Flex
      //   bgGradient="linear(to-b, transparent, surface.background)"
      //   h="32"
      //   mt="-32"
      //   zIndex={1}
      //   position="relative"
      //   direction="column"
      //   justify="flex-end"
      // />
      // <Heading
      //   as="h1"
      //   fontWeight="700"
      //   size="2xl"
      //   textTransform="capitalize"
      //   color="element.primary"
      //   mb={4}
      // >
      //   Create Location
      // </Heading>

      <div>
        {' '}
        {/* align="start" direction="column" w="100%"> */}
        {formData.address1 ? (
          <div style={{ zIndex: 100 }} id="map">
            {formData.lat && formData.lng && (
              // <Location
              //   location={{
              //     lat: parseFloat(40.0043771),
              //     lng: parseFloat(-75.21819719999999),
              //   }}
              // />
              <Location
                googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_FIREBASE_API_KEY}&g&v=3.exp&libraries=geometry,drawing,places`}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `400px` }} />}
                mapElement={<div style={{ height: `100%` }} />}
              />
            )}
            {/* console.log('form', formData) */}
            {/* lat 40.0043771 */}
            {/* lng -75.21819719999999 */}
            {/* {formData.lat && formData.lng ? (
              <>
                <Spacer height={24} />
                <GoogleMap address={formData} />
                <Spacer height={24} />
              </>
            ) : null} */}
          </div>
        ) : (
          <GoogleAutoComplete handleSelect={handleReceiveAddress} />
        )}
        {/* <Text fontWeight={400}>Address</Text>
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
          </Flex> */}
      </div>
      // </CreateLocationPageWrapper>
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
