import { Button, Select, Text, Input, Flex, Heading } from '@chakra-ui/react'
import { Autocomplete } from 'components/Autocomplete/Autocomplete'
import { CardOverlay } from 'components/CardOverlay/CardOverlay'
import { formatTimestamp, SE_API, STATUSES } from 'helpers'
import { useApi, useAuth } from 'hooks'
import { useState, useMemo, useEffect } from 'react'
import { useWholesaleRescueContext } from './WholesaleRescue'

export function EditDonation({ isOpen, handleClose }) {
  const { user } = useAuth()
  const { rescue, donation, refresh } = useWholesaleRescueContext()
  const [formData, setFormData] = useState({
    organization: null,
    location: null,
    weight: '',
    food_category: 'impact_data_produce',
    notes: '',
    pallet: null,
    date: null,
  })
  const [isLoading, setIsLoading] = useState()
  const { data: donors } = useApi(
    '/organizations',
    useMemo(() => ({ type: 'donor' }), [])
  )

  useEffect(() => {
    if (rescue && donation && donors) {
      // find which food category was used
      let food_category = null
      for (const key in donation) {
        if (!key.includes('impact_data') || key === 'impact_data_total_weight')
          continue
        if (donation[key] > 0) {
          food_category = key
          break
        }
      }
      setFormData({
        organization: donors.find(i => i.id === donation.organization_id),
        location: donation.location,
        weight: donation.impact_data_total_weight,
        food_category,
        notes: donation.notes,
        date: formatTimestamp(
          donation.timestamp_scheduled_start,
          'YYYY-MM-DDTHH:mm'
        ),
      })
    }
  }, [rescue, donation, donors])

  const totalWeight = formData.weight - palletWeight(formData.pallet)

  async function handleEditDonation() {
    setIsLoading(true)
    const payload = {
      notes: formData.notes,
      weight: totalWeight,
      food_category: formData.food_category,
      organization_id: formData.organization.id,
      location_id: formData.location.id,
      date: formData.date,
    }
    await SE_API.post(
      `/wholesale/rescue/${rescue.id}/update`,
      payload,
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
        />
      )}
      CardFooter={() => (
        <EditDonationFooter
          formData={formData}
          totalWeight={totalWeight}
          handleEditDonation={handleEditDonation}
          isLoading={isLoading}
        />
      )}
    />
  )
}

function EditDonationHeader() {
  const { cancelDonation, donation } = useWholesaleRescueContext()

  return (
    <>
      <Heading>Edit Donation</Heading>
      {donation.status !== STATUSES.CANCELLED && (
        <Button
          onClick={cancelDonation}
          size="xs"
          bg="yellow.secondary"
          color="yellow.primary"
          mt="2"
        >
          Cancel Donation
        </Button>
      )}
    </>
  )
}

function EditDonationBody({ formData, setFormData, donors }) {
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
      <Text mt="6">Date</Text>
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
      <Text mt="6">Weight</Text>
      <Input
        type="number"
        min="0"
        fontSize="sm"
        value={weight}
        onChange={updateWeight}
        onBlur={updateParentWeight}
        placeholder="0 lbs."
      />
      <Text mt="6">Food Category</Text>
      <Select
        value={formData.food_category}
        onChange={e =>
          setFormData({ ...formData, food_category: e.target.value })
        }
      >
        <option value="impact_data_produce">Produce</option>
        <option value="impact_data_dairy">Dairy</option>
        <option value="impact_data_bakery">Bakery</option>
        <option value="impact_data_meat_fish">Meat/Fish</option>
        <option value="impact_data_non_perishable">Non-perishable</option>
        <option value="impact_data_prepared_frozen">Prepared/Frozen</option>
        <option value="impact_data_mixed">Mixed</option>
        <option value="impact_data_other">Other</option>
      </Select>
      <Text mt="6">Notes</Text>
      <Input
        type="text"
        fontSize="sm"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        onBlur={updateParentNotes}
        placeholder="Add notes..."
      />
    </Flex>
  )
}

function EditDonationFooter({
  formData,
  totalWeight,
  handleEditDonation,
  isLoading,
}) {
  const { donation } = useWholesaleRescueContext()
  return (
    <Button
      size="lg"
      w="100%"
      disabled={
        !formData.organization ||
        totalWeight < 0 ||
        donation.status === STATUSES.CANCELLED
      }
      onClick={handleEditDonation}
      isLoading={isLoading}
      loadingText="Updating donation..."
    >
      Update Donation {formData.weight ? `(${totalWeight} lbs.)` : ''}
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
