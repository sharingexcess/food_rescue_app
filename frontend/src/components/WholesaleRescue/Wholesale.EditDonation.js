import { Button, Select, Text, Input, Flex, Heading } from '@chakra-ui/react'
import { Autocomplete } from 'components/Autocomplete/Autocomplete'
import { CardOverlay } from 'components/CardOverlay/CardOverlay'
import {
  EMPTY_CATEGORIZED_WEIGHT,
  formatTimestamp,
  SE_API,
  STATUSES,
} from 'helpers'
import { useApi, useAuth } from 'hooks'
import moment from 'moment'
import { useState, useMemo, useEffect } from 'react'
import { useWholesaleRescueContext } from './WholesaleRescue'

export function EditDonation({ isOpen, handleClose }) {
  const { user } = useAuth()
  const { rescue, donation, refresh } = useWholesaleRescueContext()
  const [formData, setFormData] = useState({
    organization: null,
    location: null,
    weight: '',
    food_category: 'produce',
    notes: '',
    date: null,
  })
  const [isLoading, setIsLoading] = useState()
  const { data: donors } = useApi(
    '/organizations/list',
    useMemo(() => ({ type: 'donor' }), [])
  )

  useEffect(() => {
    if (rescue && donation && donors) {
      // find which food category was used
      let food_category = null
      for (const key in donation.categorized_weight) {
        if (donation.categorized_weight[key] > 0) {
          food_category = key
          break
        }
      }
      setFormData({
        organization: donors.find(i => i.id === donation.organization_id),
        location: donation.location,
        weight: donation.total_weight,
        food_category,
        notes: donation.notes,
        date: formatTimestamp(rescue.timestamp_scheduled, 'YYYY-MM-DDTHH:mm'),
      })
    }
  }, [rescue, donation, donors])

  async function handleEditDonation() {
    setIsLoading(true)
    const rescue_payload = {
      id: rescue.id,
      type: rescue.type,
      status: rescue.status,
      handler_id: rescue.handler_id,
      notes: formData.notes,
      weight: formData.weight,
      timestamp_scheduled: moment(formData.date).toISOString(),
      timestamp_completed: rescue.timestamp_completed
        ? moment(rescue.timestamp_completed).toISOString()
        : null,
      transfer_ids: rescue.transfer_ids,
    }
    await SE_API.post(
      `/rescues/update/${rescue.id}`,
      rescue_payload,
      user.accessToken
    )
    const transfer_payload = {
      id: donation.id,
      type: donation.type,
      status: donation.status,
      rescue_id: donation.rescue_id,
      rescue_scheduled_time: donation.rescue_scheduled_time || null,
      handler_id: donation.handler_id,
      organization_id: donation.organization_id,
      location_id: donation.location_id,
      notes: formData.notes,
      timestamp_completed: moment(formData.date).toISOString(),
      total_weight: formData.weight,
      categorized_weight: EMPTY_CATEGORIZED_WEIGHT(),
    }
    transfer_payload.categorized_weight[formData.food_category] =
      formData.weight
    await SE_API.post(
      `/transfers/update/${donation.id}`,
      transfer_payload,
      user.accessToken
    )
    refresh()
    setIsLoading(false)
    handleClose()
  }

  return (
    <CardOverlay
      isOpen={isOpen}
      closeHandler={handleClose}
      CardHeader={EditDonationHeader}
      CardBody={() => (
        <EditDonationBody
          formData={formData}
          setFormData={setFormData}
          donors={donors}
          rescue={rescue}
        />
      )}
      CardFooter={() => (
        <EditDonationFooter
          formData={formData}
          handleEditDonation={handleEditDonation}
          isLoading={isLoading}
        />
      )}
    />
  )
}

function EditDonationHeader() {
  const { cancelDonation, donation, rescue } = useWholesaleRescueContext()

  return (
    <>
      <Heading>Edit Collection</Heading>
      {donation.status !== STATUSES.CANCELLED && (
        <Button
          onClick={cancelDonation}
          size="xs"
          bg="yellow.secondary"
          color="yellow.primary"
          mt="2"
          disabled={rescue.status === STATUSES.COMPLETED}
        >
          Cancel Donation
        </Button>
      )}
    </>
  )
}

function EditDonationBody({ formData, setFormData, donors, rescue }) {
  const [weight, setWeight] = useState(formData.weight)
  const [notes, setNotes] = useState(formData.notes)
  const [date, setDate] = useState(formData.date)

  function handleDonorSearch(value) {
    return donors.filter(i =>
      i.name.toLowerCase().includes(value.toLowerCase())
    )
  }

  function updateWeight(e) {
    setWeight(Math.max(parseInt(e.target.value), 0) || '')
  }

  function updateParentWeight() {
    setFormData({ ...formData, weight })
  }

  function updateParentNotes() {
    setFormData({ ...formData, notes })
  }

  function updateParentDate() {
    setFormData({ ...formData, date })
  }

  function handleSelectDonor(value) {
    const location = value?.locations.length === 1 ? value.locations[0] : null
    setFormData({ ...formData, organization: value, location })
  }

  return (
    <Flex direction="column" minH="128">
      <Text
        color="element.tertiary"
        fontSize="xs"
        fontWeight="700"
        textTransform="uppercase"
      >
        Date
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
        label="Donor"
        placeholder="Name..."
        value={formData.organization}
        setValue={handleSelectDonor}
        displayField="name"
        handleChange={handleDonorSearch}
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
          {formData.organization.locations.map(i => (
            <option value={i.id} key={i.id}>
              {i.nickname ? `${i.nickname} (${i.address1})` : i.address1}
            </option>
          ))}
        </Select>
      )}
      <Text
        color="element.tertiary"
        fontSize="xs"
        fontWeight="700"
        textTransform="uppercase"
        mt="6"
      >
        Weight
      </Text>
      <Input
        type="number"
        min="0"
        fontSize="sm"
        value={weight}
        onChange={updateWeight}
        onBlur={updateParentWeight}
        placeholder="0 lbs."
        disabled={rescue.status === STATUSES.COMPLETED}
      />
      <Text
        color="element.tertiary"
        fontSize="xs"
        fontWeight="700"
        textTransform="uppercase"
        mt="6"
      >
        Notes
      </Text>
      <Input
        type="text"
        fontSize="sm"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        onBlur={updateParentNotes}
        placeholder="Add notes..."
      />
      <Text
        color="element.tertiary"
        fontSize="xs"
        fontWeight="700"
        textTransform="uppercase"
        mt="6"
      >
        Food Category *
      </Text>
      <Select
        defaultValue={formData.food_category}
        disabled={true}
        // we currently don't allow changing the food category
      >
        <option value="produce">Produce</option>
        <option value="dairy">Dairy</option>
        <option value="bakery">Bakery</option>
        <option value="meat_fish">Meat/Fish</option>
        <option value="non_perishable">Non-perishable</option>
        <option value="prepared_frozen">Prepared/Frozen</option>
        <option value="mixed">Mixed</option>
        <option value="other">Other</option>
      </Select>
      <Text fontSize="xs" color="element.secondary" mt="2">
        * Food category cannot be edited at this time.
      </Text>
    </Flex>
  )
}

function EditDonationFooter({ formData, handleEditDonation, isLoading }) {
  const { donation } = useWholesaleRescueContext()
  return (
    <Button
      size="lg"
      w="100%"
      disabled={
        !formData.organization ||
        formData.weight < 0 ||
        donation.status === STATUSES.CANCELLED
      }
      onClick={handleEditDonation}
      isLoading={isLoading}
      loadingText="Updating Collection..."
    >
      Update Collection {formData.weight ? `(${formData.weight} lbs.)` : ''}
    </Button>
  )
}
