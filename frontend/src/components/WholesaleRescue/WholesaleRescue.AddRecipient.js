import { EditIcon } from '@chakra-ui/icons'
import {
  Button,
  Select,
  Text,
  Input,
  Flex,
  Heading,
  InputGroup,
  InputLeftElement,
  Box,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
} from '@chakra-ui/react'
import { Autocomplete } from 'components/Autocomplete/Autocomplete'
import { CardOverlay } from 'components/CardOverlay/CardOverlay'
import {
  calculateCurrentLoad,
  EMPTY_CATEGORIZED_WEIGHT,
  SE_API,
  STATUSES,
  TRANSFER_TYPES,
} from 'helpers'
import { useApi, useAuth } from 'hooks'
import moment from 'moment'
import { useState, useMemo, useEffect } from 'react'
import { useWholesaleRescueContext } from './WholesaleRescue'

export function AddRecipient({ isOpen, handleClose }) {
  const { rescue, refresh } = useWholesaleRescueContext()
  const currentLoad = useMemo(() => calculateCurrentLoad(rescue), [rescue])
  const donationTotal = useMemo(
    () => rescue.transfers[0].total_weight,
    [rescue]
  )
  const remainingPercent = useMemo(
    () => (currentLoad / donationTotal) * 100,
    [donationTotal, currentLoad]
  )
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    organization: null,
    location: null,
    weight: currentLoad,
    notes: '',
    percent_of_total_dropped: remainingPercent,
    timestamp_completed: moment().format('YYYY-MM-DDTHH:mm'),
  })
  const [isLoading, setIsLoading] = useState(false)
  const { data: recipients } = useApi(
    '/organizations/list',
    useMemo(() => ({ type: 'recipient' }), [])
  )

  async function handleAddRecipient() {
    setIsLoading(true)
    const payload = {
      type: TRANSFER_TYPES.DISTRIBUTION,
      status: STATUSES.COMPLETED,
      rescue_id: rescue.id,
      handler_id: rescue.handler_id,
      organization_id: formData.organization.id,
      location_id: formData.location.id,
      notes: formData.notes,
      timestamp_completed: moment(
        formData.timestamp_completed || null
      ).toISOString(),
      total_weight: formData.weight,
      categorized_weight: EMPTY_CATEGORIZED_WEIGHT(),
      percent_of_total_dropped: formData.percent_of_total_dropped,
    }

    // this is hacky.
    // because wholesale rescues only have weight in a single food category,
    // we just need to figure out which one was used in the original collection.
    // so we iterate through the collection to find a category with a value,
    // then populate that category in this distribution with the weight
    // we already calculated above (this ensures categorized sum === total_weight)
    for (const category in rescue.transfers[0].categorized_weight) {
      if (rescue.transfers[0].categorized_weight[category]) {
        payload.categorized_weight[category] = payload.total_weight
        break
      }
    }
    const distribution = await SE_API.post(
      '/transfers/create',
      payload,
      user.accessToken
    )
    // then add the new distribution id to the rescue's transfer_id list
    await SE_API.post(
      `/rescues/update/${rescue.id}`,
      {
        id: rescue.id,
        type: rescue.type,
        status: rescue.status,
        handler_id: rescue.handler_id,
        notes: rescue.notes,
        timestamp_scheduled: moment(rescue.timestamp_scheduled).toISOString(),
        timestamp_completed: null,
        transfer_ids: [...rescue.transfer_ids, distribution.id],
      },
      user.accessToken
    )
    refresh()
    setIsLoading(false)
    setFormData({ ...formData, location: null, organization: null, notes: '' })
    handleClose()
  }

  useEffect(() => {
    setFormData({ ...formData, weight: currentLoad })
  }, [currentLoad])

  useEffect(() => {
    setFormData({ ...formData, percent_of_total_dropped: remainingPercent })
  }, [remainingPercent])

  return (
    <CardOverlay
      isOpen={isOpen}
      closeHandler={handleClose}
      CardHeader={AddRecipientHeader}
      CardBody={() => (
        <AddRecipientBody
          formData={formData}
          currentLoad={currentLoad}
          donationTotal={donationTotal}
          remainingPercent={remainingPercent}
          setFormData={setFormData}
          recipients={recipients}
        />
      )}
      CardFooter={() => (
        <AddRecipientFooter
          formData={formData}
          setFormData={setFormData}
          handleAddRecipient={handleAddRecipient}
          isLoading={isLoading}
        />
      )}
    />
  )
}

function AddRecipientHeader() {
  return <Heading>New Recipient</Heading>
}

function AddRecipientBody({
  formData,
  setFormData,
  recipients,
  currentLoad,
  donationTotal,
  remainingPercent,
}) {
  const [weight, setWeight] = useState(
    formData.weight == null ? currentLoad : formData.weight
  )
  const [date, setDate] = useState(formData.timestamp_completed)

  const [percent, setPercent] = useState(
    formData.percent_of_total_dropped == null
      ? remainingPercent
      : formData.percent_of_total_dropped
  )

  function handleRecipientSearch(value) {
    return recipients
      ? recipients
          .filter(i => i.locations?.length)
          .filter(i => i.name.toLowerCase().includes(value.toLowerCase()))
      : []
  }

  function updateParentDate() {
    setFormData({ ...formData, timestamp_completed: date })
  }

  function updateWeight(e) {
    setWeight(Math.max(parseFloat(e.target.value), 0) || '')
  }

  async function handleChangeSlider(value) {
    setPercent(value)
    setWeight(Math.round((value / 100) * donationTotal))
  }

  function handleSelectRecipient(value) {
    const location = value?.locations?.length === 1 ? value.locations[0] : null
    setFormData({ ...formData, organization: value, location })
  }

  async function updateFormDataWeight() {
    const updatedWeight = Math.min(
      Math.max(parseFloat(weight) || 0, 0),
      currentLoad
    )
    const updatedPercent = parseFloat(
      ((updatedWeight / donationTotal) * 100).toFixed(3)
    )
    setFormData({
      ...formData,
      weight: updatedWeight,
      percent_of_total_dropped: updatedPercent,
    })
    setWeight(updatedWeight)
    setPercent(updatedPercent)
  }

  return (
    <Flex direction="column" minH="128">
      <Text
        color="element.tertiary"
        fontSize="xs"
        fontWeight="700"
        textTransform="uppercase"
      >
        Completed at:
      </Text>
      <Input
        type="datetime-local"
        fontSize="sm"
        value={date}
        onChange={e => setDate(e.target.value)}
        onBlur={updateParentDate}
        mb="6"
      />
      <Autocomplete
        label="Recipient Organization"
        placeholder="Name..."
        value={formData.organization}
        setValue={handleSelectRecipient}
        displayField="name"
        handleChange={handleRecipientSearch}
      />
      {formData.organization && (
        <Select
          fontSize="sm"
          my="2"
          placeholder="Choose a location..."
          value={formData.location?.id}
          onChange={e =>
            setFormData({
              ...formData,
              location: formData.organization.locations.find(
                i => i.id === e.target.value
              ),
            })
          }
        >
          {formData.organization?.locations.map(i => (
            <option value={i.id} key={i.id}>
              {i.nickname ? `${i.nickname} (${i.address1})` : i.address1}
            </option>
          ))}
        </Select>
      )}

      <Flex w="100%" justify="center" mt="16">
        <Input
          w="96px"
          h="64px"
          fontSize="4xl"
          fontWeight="bold"
          color="element.primary"
          type="number"
          min="0"
          max={currentLoad}
          value={weight}
          onChange={updateWeight}
          onBlur={updateFormDataWeight}
          textAlign="right"
          py="2"
        />
        <Text fontSize="3xl" fontWeight="bold" ml="3" mt="2">
          lbs.
        </Text>
      </Flex>
      <Flex
        justify="start"
        w="100%"
        gap={4}
        align="center"
        mt="8"
        mb="12"
        maxW="500px"
        mx="auto"
      >
        <Text w="48px" fontWeight="bold">
          {percent.toFixed(0)}%
        </Text>
        <RangeSlider
          colorScheme="green"
          value={[percent, remainingPercent]}
          onChange={values => handleChangeSlider(values[0])}
          flexGrow={1}
          step={0.1}
          onChangeEnd={updateFormDataWeight}
          position="relative"
        >
          <RangeSliderTrack h="2" borderRadius="4px" bg="se.brand.primary">
            <RangeSliderFilledTrack h="2" bg="element.secondary" />
          </RangeSliderTrack>
          <RangeSliderThumb index={0} zIndex="2" h="8" w="8" />
          <RangeSliderThumb
            index={1}
            zIndex="1"
            display="none"
            pointerEvents="none"
          />
          <Flex
            position="absolute"
            right="0"
            top="3"
            borderRadius="0 4px 4px 0"
            h="2"
            w={`${100 - remainingPercent}%`}
            bg="element.tertiary"
            justify="center"
            align="center"
          />
        </RangeSlider>
      </Flex>
    </Flex>
  )
}

function AddRecipientFooter({
  formData,
  setFormData,
  handleAddRecipient,
  isLoading,
}) {
  const [notes, setNotes] = useState(formData.notes)

  return (
    <Box w="100%">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <EditIcon mb="3" color="element.tertiary" />
        </InputLeftElement>
        <Input
          size="sm"
          color="element.secondary"
          value={notes}
          placeholder="Add notes to this delivery..."
          onChange={e => setNotes(e.target.value)}
          onBlur={() => setFormData({ ...formData, notes })}
          mb="4"
        />
      </InputGroup>
      <Button
        size="lg"
        w="100%"
        disabled={!formData.location || !formData.weight}
        onClick={handleAddRecipient}
        isLoading={isLoading}
        loadingText={'Adding Recipient...'}
      >
        Add Recipient
      </Button>
    </Box>
  )
}
