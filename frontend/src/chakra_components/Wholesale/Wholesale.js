import { CalendarIcon, ChevronRightIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Skeleton,
  Text,
} from '@chakra-ui/react'
import { PageTitle, CardOverlay, Autocomplete } from 'chakra_components'
import { FooterButton } from 'chakra_components/FooterButton/FooterButton'
import { formatTimestamp, STATUSES } from 'helpers'
import { useApi, useAuth } from 'hooks'
import { Fragment, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export function Wholesale() {
  const [date, setDate] = useState(formatTimestamp(new Date(), 'YYYY-MM-DD'))
  const [addDonation, setAddDonation] = useState(false)
  const { hasAdminPermission } = useAuth()
  const { data: rescues } = useApi(
    '/rescues',
    useMemo(() => ({ type: 'wholesale', date: date }), [date])
  )

  function handleChangeDate(event) {
    const dateValue = event.target.value
      ? formatTimestamp(event.target.value, 'YYYY-MM-DD')
      : ''
    setDate(dateValue)
  }

  return (
    <>
      <PageTitle>Wholesale</PageTitle>
      <Flex w="100%" justify="space-between" align="center" mb="4">
        <Heading size="md" flexBasis="50%">
          {formatTimestamp(date, 'dddd, MMM. DD')}
        </Heading>
        <InputGroup flexGrow="1" flexBasis="128px">
          <Input
            type="date"
            value={date}
            onChange={e => handleChangeDate(e)}
            fontSize="sm"
            color="element.secondary"
          />
          <InputRightElement pointerEvents="none">
            <CalendarIcon mr="2" color="element.tertiary" />
          </InputRightElement>
        </InputGroup>
      </Flex>
      {rescues ? (
        rescues.map((rescue, i) => (
          <Fragment key={i}>
            <WholesaleRescue rescue={rescue} />
            {i < rescues.length - 1 && <Divider />}
          </Fragment>
        ))
      ) : (
        <>
          <Skeleton w="100%" h="32" my="4" />
          <Skeleton w="100%" h="32" my="4" />
          <Skeleton w="100%" h="32" my="4" />
          <Skeleton w="100%" h="32" my="4" />
        </>
      )}

      {hasAdminPermission && (
        <FooterButton onClick={() => setAddDonation(true)}>
          Add Donation
        </FooterButton>
      )}
      <AddDonation
        isOpen={addDonation}
        handleClose={() => setAddDonation(false)}
      />
    </>
  )
}

function WholesaleRescue({ rescue }) {
  const donation = rescue.stops[0]
  return (
    <Flex gap="6" justify="space-between" align="center" py="6">
      <Box
        w="4"
        h="4"
        borderRadius="xl"
        flexGrow="0"
        flexShrink="0"
        bg={
          rescue.status === STATUSES.COMPLETED
            ? 'se.brand.primary'
            : 'se.brand.white'
        }
        border="3px solid"
        borderColor={
          rescue.status === STATUSES.COMPLETED
            ? 'se.brand.primary'
            : 'blue.primary'
        }
      />
      <Box flexGrow="1">
        <Heading
          size="md"
          fontWeight="600"
          color={
            rescue.status === STATUSES.COMPLETED
              ? 'element.primary'
              : 'blue.primary'
          }
        >
          {donation.organization.name}
        </Heading>
        <Text fontSize="sm" color="element.tertiary" fontWeight="300">
          {donation.impact_data_total_weight} lbs.&nbsp;&nbsp;|&nbsp;&nbsp;
          {donation.notes}
        </Text>
      </Box>
      <Link to={`/wholesale/${rescue.id}`}>
        <IconButton
          variant="ghosted"
          icon={<ChevronRightIcon w="6" h="6" color="element.tertiary" />}
        />
      </Link>
    </Flex>
  )
}

function AddDonation({ isOpen, handleClose }) {
  const [formData, setFormData] = useState({
    donor: null,
    weight: '',
    category: 'impact_data_produce',
    notes: '',
    pallet: null,
  })
  return (
    <CardOverlay
      isOpen={isOpen}
      closeHandler={handleClose}
      CardHeader={AddDonationHeader}
      CardBody={() => (
        <AddDonationBody formData={formData} setFormData={setFormData} />
      )}
      CardFooter={() => <AddDonationFooter formData={formData} />}
    />
  )
}

function AddDonationHeader() {
  return <Heading>New Donation</Heading>
}
function AddDonationBody({ formData, setFormData }) {
  const { data: donors } = useApi(
    '/organizations',
    useMemo(() => ({ type: 'donor' }), [])
  )
  const [weight, setWeight] = useState(formData.weight)
  const [notes, setNotes] = useState(formData.notes)

  function handleDonorSearch(value) {
    console.log(donors, value)
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

  return (
    <Flex direction="column" minH="128">
      <Autocomplete
        label="Donor"
        placeholder="Name..."
        value={formData.donor}
        setValue={value => setFormData({ ...formData, donor: value })}
        displayField="name"
        handleChange={handleDonorSearch}
      />
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
        value={formData.category}
        onChange={e => setFormData({ ...formData, category: e.target.value })}
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
      <Text mt="6">Subtract Pallet Weight</Text>
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
          variant={formData.pallet === 'plastic' ? 'secondary' : 'tertiary'}
          onClick={() => setFormData({ ...formData, pallet: 'plastic' })}
        >
          Plastic
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
function AddDonationFooter({ formData }) {
  const totalWeight = formData.weight - palletWeight(formData.pallet)

  return (
    <Button size="lg" w="100%" disabled={!formData.donor || totalWeight < 0}>
      Add Donation ({totalWeight} lbs.)
    </Button>
  )
}

function palletWeight(type) {
  if (!type) return 0
  switch (type) {
    case 'wood':
      return 175
    case 'plastic':
      return 200
    case 'blue':
      return 350
    default:
      return 0
  }
}
