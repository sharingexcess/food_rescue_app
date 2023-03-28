import { Button, Select, Text, Input, Flex, Heading } from '@chakra-ui/react'
import { Autocomplete } from 'components/Autocomplete/Autocomplete'
import { CardOverlay } from 'components/CardOverlay/CardOverlay'
import {
  EMPTY_CATEGORIZED_WEIGHT,
  formatTimestamp,
  SE_API,
  STATUSES,
  TRANSFER_TYPES,
} from 'helpers'
import { useApi, useAuth } from 'hooks'
import moment from 'moment'
import { useState, useMemo } from 'react'

export function AddDonation({ isOpen, handleClose, refresh, defaultDate }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    date: formatTimestamp(defaultDate || new Date(), 'YYYY-MM-DDTHH:mm'),
    organization: null,
    location: null,
    weight: '',
    food_category: 'produce',
    notes: '',
    pallet: null,
  })
  const [isLoading, setIsLoading] = useState()
  const { data: donors } = useApi(
    '/organizations/list',
    useMemo(() => ({ type: 'donor' }), [])
  )

  const totalWeight = formData.weight - palletWeight(formData.pallet)

  async function handleCreateRescue() {
    setIsLoading(true)

    // const payload = {
    //   handler_id: user.id,
    //   notes: formData.notes,
    //   food_category: formData.food_category,
    //   weight: totalWeight,
    //   organization_id: formData.organization.id,
    //   location_id: formData.location.id,
    //   date: formData.date,
    // }

    const payload = {
      type: 'wholesale',
      status: STATUSES.ACTIVE,
      handler_id: user.id,
      notes: formData.notes || '',
      timestamp_scheduled: moment(formData.date).toISOString(),
      timestamp_completed: null,
      transfers: [
        {
          type: TRANSFER_TYPES.COLLECTION,
          status: STATUSES.COMPLETED,
          handler_id: user.id,
          organization_id: formData.organization.id,
          location_id: formData.location.id,
          notes: formData.notes || '',
          timestamp_completed: moment(formData.date).toISOString(),
          total_weight: formData.weight - palletWeight(formData.pallet),
          categorized_weight: EMPTY_CATEGORIZED_WEIGHT(),
        },
      ],
    }

    // add categorized weight
    payload.transfers[0].categorized_weight[formData.food_category] =
      payload.transfers[0].total_weight

    await SE_API.post('/rescues/create', payload, user.accessToken)
    refresh()
    setIsLoading(false)
    handleClose()
  }

  return (
    <CardOverlay
      isOpen={isOpen}
      closeHandler={handleClose}
      CardHeader={AddDonationHeader}
      CardBody={() => (
        <AddDonationBody
          formData={formData}
          setFormData={setFormData}
          donors={donors}
        />
      )}
      CardFooter={() => (
        <AddDonationFooter
          formData={formData}
          totalWeight={totalWeight}
          handleCreateRescue={handleCreateRescue}
          isLoading={isLoading}
        />
      )}
    />
  )
}

function AddDonationHeader() {
  return <Heading>New Donation</Heading>
}

function AddDonationBody({ formData, setFormData, donors }) {
  const [weight, setWeight] = useState(formData.weight)
  const [date, setDate] = useState(formData.date)
  const [notes, setNotes] = useState(formData.notes)

  function handleDonorSearch(value) {
    return donors
      ? donors
          .filter(i => i.locations?.length)
          .filter(i => i.name.toLowerCase().includes(value.toLowerCase()))
      : []
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
    const location = value?.locations?.length === 1 ? value.locations[0] : null
    setFormData({ ...formData, organization: value, location })
  }

  return (
    <Flex direction="column" minH="128">
      <Text
        color="element.tertiary"
        fontSize="xs"
        fontWeight="700"
        mt="6"
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
        listBackground="surface.background"
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
        mt="6"
        textTransform="uppercase"
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
      />

      <Text
        color="element.tertiary"
        fontSize="xs"
        fontWeight="700"
        mt="6"
        textTransform="uppercase"
      >
        Food Category
      </Text>
      <Select
        value={formData.food_category}
        onChange={e =>
          setFormData({ ...formData, food_category: e.target.value })
        }
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

      <Text
        color="element.tertiary"
        fontSize="xs"
        fontWeight="700"
        mt="6"
        textTransform="uppercase"
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
        mt="6"
        textTransform="uppercase"
      >
        Subtract Pallet Weight
      </Text>
      <Flex justify="space-between" gap="2" mt="4" mb="4">
        <Button
          flexGrow={1}
          variant={!formData.pallet ? 'secondary' : 'tertiary'}
          onClick={() => setFormData({ ...formData, pallet: null })}
        >
          None
        </Button>
        <Button
          flexGrow={1}
          variant={formData.pallet === 'wood' ? 'secondary' : 'tertiary'}
          onClick={() => setFormData({ ...formData, pallet: 'wood' })}
        >
          Wood
        </Button>
        <Button
          flexGrow={1}
          variant={formData.pallet === 'black' ? 'secondary' : 'tertiary'}
          onClick={() => setFormData({ ...formData, pallet: 'black' })}
        >
          Black
        </Button>
        <Button
          flexGrow={1}
          variant={formData.pallet === 'blue' ? 'secondary' : 'tertiary'}
          onClick={() => setFormData({ ...formData, pallet: 'blue' })}
        >
          Blue
        </Button>
      </Flex>
    </Flex>
  )
}

function AddDonationFooter({
  formData,
  totalWeight,
  handleCreateRescue,
  isLoading,
}) {
  return (
    <Button
      size="lg"
      w="100%"
      disabled={!formData.organization || totalWeight < 0}
      onClick={handleCreateRescue}
      isLoading={isLoading}
      loadingText={'Saving donation...'}
    >
      Add Donation {formData.weight ? `(${totalWeight} lbs.)` : ''}
    </Button>
  )
}

function palletWeight(type) {
  if (!type) return 0
  switch (type) {
    case 'wood':
      return 345
    case 'black':
      return 350
    case 'blue':
      return 373
    default:
      return 0
  }
}
