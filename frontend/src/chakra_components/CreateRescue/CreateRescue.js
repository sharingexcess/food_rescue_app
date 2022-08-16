import { CloseIcon, DragHandleIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  Select,
  Text,
} from '@chakra-ui/react'
import { Page, Autocomplete } from 'chakra_components'
import { useApi, useAuth, useIsMobile } from 'hooks'
import { useEffect, useMemo, useState } from 'react'
import { getDefaultEndTime, getDefaultStartTime } from './CreateRescue.utils'
import { Reorder } from 'framer-motion'
import { createTimestamp, generateUniqueId, SE_API, STATUSES } from 'helpers'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'

export function CreateRescue() {
  const { user } = useAuth()
  const { data: handlers } = useApi('/publicProfiles')
  const { data: donors } = useApi(
    '/organizations',
    useMemo(() => ({ type: 'donor' }), [])
  )
  const { data: recipients } = useApi(
    '/organizations',
    useMemo(() => ({ type: 'recipient' }), [])
  )

  const form_data_cache = sessionStorage.getItem(
    'se_create_rescue_form_data_cache'
  )
  const [formData, setFormData] = useState(
    form_data_cache
      ? JSON.parse(form_data_cache)
      : {
          timestamp_scheduled_start: getDefaultStartTime(),
          timestamp_scheduled_finish: getDefaultEndTime(),
          handler: null,
        }
  )
  const [view, setView] = useState(null)
  const [working, setWorking] = useState(false)
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const stops_cache = sessionStorage.getItem('se_create_rescue_stops_cache')
  const [stops, setStops] = useState(stops_cache ? JSON.parse(stops_cache) : [])

  useEffect(() => {
    sessionStorage.setItem(
      'se_create_rescue_form_data_cache',
      JSON.stringify(formData)
    )
  }, [formData])

  useEffect(() => {
    stops?.length
      ? sessionStorage.setItem(
          'se_create_rescue_stops_cache',
          JSON.stringify(stops)
        )
      : sessionStorage.removeItem('se_create_rescue_stops_cache')
  }, [stops])

  async function handleAddStop(stop) {
    const id = await generateUniqueId('stops')
    setStops(currentStops => [
      ...currentStops,
      {
        ...stop,
        id,
        organization_id: stop.organization.id,
        location_id: stop.location.id,
      },
    ])
    setView(null)
  }

  function removeStop(index) {
    if (window.confirm('Are you sure you want to remove this stop?')) {
      setStops([...stops.slice(0, index), ...stops.slice(index + 1)])
    }
  }

  async function handleCreateRescue() {
    setWorking(true)
    const id = await generateUniqueId('rescues')
    sessionStorage.removeItem('se_create_rescue_stops_cache')
    sessionStorage.removeItem('se_create_rescue_form_data_cache')

    await SE_API.post(
      `/rescues/${id}/create`,
      {
        formData: {
          handler_id: formData.handler?.id || null,
          stops,
          is_direct_link: false,
        },
        status_scheduled: STATUSES.SCHEDULED,
        timestamp_scheduled_start: moment(
          formData.timestamp_scheduled_start
        ).toDate(),
        timestamp_scheduled_finish: moment(
          formData.timestamp_scheduled_finish
        ).toDate(),
        timestamp_created: createTimestamp(),
        timestamp_updated: createTimestamp(),
      },
      user.accessToken
    )
    navigate(`/rescues/${id}`)
  }

  const isValidRescue =
    formData.timestamp_scheduled_start &&
    formData.timestamp_scheduled_finish &&
    formData.timestamp_scheduled_start < formData.timestamp_scheduled_finish &&
    stops.length >= 2 &&
    stops[0].type == 'pickup' &&
    stops[stops.length - 1].type === 'delivery'

  return (
    <Page
      title="Create Rescue"
      minH="64vh"
      pullToRefresh={false}
      breadcrumbs={[
        { label: 'Rescues', link: '/rescues' },
        { label: 'Create', link: '/create-rescue' },
      ]}
    >
      <Heading
        as="h1"
        fontWeight="700"
        size="2xl"
        mb="24px"
        textTransform="capitalize"
        color="element.primary"
      >
        Create Rescue
      </Heading>
      <InfoForm
        formData={formData}
        setFormData={setFormData}
        handlers={handlers}
      />
      <Stops stops={stops} setStops={setStops} removeStop={removeStop} />
      {view ? (
        <AddStop
          type={view}
          handleAddStop={handleAddStop}
          handleCancel={() => setView(null)}
          organizations={
            view === 'pickup' ? donors : view === 'delivery' ? recipients : null
          }
        />
      ) : (
        <Flex w="100%" gap="4" mt="8" mb="4" justify="center" wrap="wrap">
          <Button
            variant="secondary"
            onClick={() => setView('pickup')}
            flexGrow={isMobile ? '1' : '0'}
            background="blue.secondary"
            color="blue.primary"
            isLoading={!donors}
          >
            {stops.length === 0 ? 'Add Stops' : 'Add Pickup'}
          </Button>
          {stops.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => setView('delivery')}
              flexGrow={isMobile ? '1' : '0'}
              isLoading={!recipients}
            >
              Add Delivery
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleCreateRescue}
            flexGrow="1"
            flexBasis={isMobile ? '100%' : null}
            isLoading={working}
            disabled={!isValidRescue}
            loadingText="Creating Rescue..."
          >
            Create Rescue
          </Button>
        </Flex>
      )}
    </Page>
  )
}

function InfoForm({ formData, setFormData, handlers }) {
  function searchForHandler(value) {
    return handlers.filter(i =>
      i.name.toLowerCase().includes(value.toLowerCase())
    )
  }

  return (
    <Flex direction="column" mb="8">
      <Text color="element.primary" fontWeight="600">
        Start Time
      </Text>
      <Input
        value={formData.timestamp_scheduled_start}
        variant="flushed"
        type="datetime-local"
        textAlign="left"
        mb="6"
        onChange={e =>
          setFormData({
            ...formData,
            timestamp_scheduled_start: e.target.value,
          })
        }
      />

      <Text color="element.primary" fontWeight="600">
        End Time
      </Text>
      <Input
        value={formData.timestamp_scheduled_finish}
        variant="flushed"
        type="datetime-local"
        textAlign="left"
        mb="6"
        onChange={e =>
          setFormData({
            ...formData,
            timestamp_scheduled_finish: e.target.value,
          })
        }
      />

      <Text color="element.primary" fontWeight="600">
        Handler
        <Text
          as="span"
          verticalAlign="5%"
          fontWeight="300"
          fontSize="xs"
          pb="1"
          ml="2"
          color="element.secondary"
        >
          (optional)
        </Text>
      </Text>
      <Autocomplete
        placeholder="Search by name..."
        value={formData.handler}
        setValue={handler => setFormData({ ...formData, handler })}
        handleChange={name => searchForHandler(name)}
        optionLabel={option => `${option.name} (${option.email})`}
        displayField="name"
      />
    </Flex>
  )
}

function AddStop({ type, handleAddStop, handleCancel, organizations }) {
  const [organization, setOrganization] = useState()
  const [location, setLocation] = useState()

  useEffect(() => {
    if (organization && organization.locations.length === 1) {
      setLocation(organization.locations[0])
    }
  }, [organization])

  useEffect(() => {
    if (organization && location) {
      handleAddStop({ type, organization, location })
    }
  }, [organization, location])

  function handleSearchForOrganization(value) {
    return organizations.filter(i =>
      i.name.toLowerCase().includes(value.toLowerCase())
    )
  }

  return (
    <Flex
      direction="column"
      px="4"
      pt="2"
      pb="4"
      my="3"
      bg="surface.card"
      boxShadow="md"
      borderRadius="md"
    >
      <Flex justify={'space-between'} align="center" mb="2">
        <Heading
          as="h6"
          fontWeight="600"
          letterSpacing={1}
          fontSize="sm"
          color={type === 'pickup' ? 'blue.primary' : 'green.primary'}
          textTransform="uppercase"
        >
          New {type}
        </Heading>
        <IconButton
          variant="ghosted"
          icon={<CloseIcon w="3" color="element.tertiary" />}
          onClick={handleCancel}
        />
      </Flex>
      <Autocomplete
        placeholder="Donor Organization..."
        value={organization}
        setValue={setOrganization}
        handleChange={value => handleSearchForOrganization(value)}
        displayField="name"
      />
      {organization && (
        <Select
          variant="flushed"
          fontSize="sm"
          my="2"
          placeholder="Choose a location..."
          value={location}
          onChange={e =>
            setLocation(
              organization.locations.find(i => i.id === e.target.value)
            )
          }
        >
          {organization.locations.map(i => (
            <option value={i.id} key={i.id}>
              {i.nickname ? `${i.nickname} (${i.address1})` : i.address1}
            </option>
          ))}
        </Select>
      )}
    </Flex>
  )
}

function Stops({ stops, setStops, removeStop }) {
  // Because the Drag and Drop component can only handle string items,
  // stringify each stop here, then parse as we pass to the component
  const [stringStops, setStringStops] = useState(
    stops.map(stop => JSON.stringify(stop))
  )
  useEffect(() => {
    setStringStops(stops.map(stop => JSON.stringify(stop)))
  }, [stops])

  // keep track of when drag events finish to update parent state
  const [shouldReorder, setShouldReorder] = useState(false)
  useEffect(() => {
    if (shouldReorder && stringStops) {
      // if we have reordered stops, update the parent state
      setStops(stringStops.map(stop => JSON.parse(stop)))
      setShouldReorder(false)
    }
  }, [shouldReorder, stringStops])

  function handlePointerUp() {
    // when a drag event stops, allow animations to finish smoothly
    // then trigger an update of the parent state
    setTimeout(() => {
      setShouldReorder(true)
    }, 800)
  }

  return (
    <Reorder.Group
      as="section"
      axis="y"
      values={stringStops}
      onReorder={setStringStops}
    >
      {stringStops.map((stringStop, i) => (
        <Reorder.Item
          as="div"
          key={stringStop}
          value={stringStop}
          onPointerUp={handlePointerUp}
        >
          <Stop
            stop={JSON.parse(stringStop)}
            removeStop={() => removeStop(i)}
          />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}

function Stop({ stop, removeStop }) {
  return (
    <Flex
      my="3"
      bg="surface.card"
      boxShadow="md"
      borderRadius="md"
      justify="flex-start"
      align="center"
      cursor="grab"
      _active={{ cursor: 'grabbing' }}
    >
      <IconButton
        variant="ghosted"
        icon={<DragHandleIcon color="element.tertiary" w="3" />}
      />
      <Box w="100%" pb="4" pt="3">
        <Flex justify={'space-between'} align="center" py="1">
          <Heading
            as="h6"
            fontWeight="600"
            letterSpacing={1}
            fontSize="sm"
            color="element.tertiary"
            textTransform="uppercase"
          >
            {stop.type}
          </Heading>
          <IconButton
            variant="ghosted"
            icon={<CloseIcon w="3" color="element.tertiary" />}
            onClick={removeStop}
            height="unset"
            px="2"
          />
        </Flex>
        <Heading as="h3" size="md" fontWeight="600" color="element.primary">
          {stop.organization.name}
        </Heading>
        <Text as="p" fontWeight="300" color="element.secondary">
          {stop.location.nickname || stop.location.address1}
        </Text>
      </Box>
    </Flex>
  )
}
