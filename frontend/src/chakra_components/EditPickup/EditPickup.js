import { CheckIcon, DeleteIcon } from '@chakra-ui/icons'
import {
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  Select,
  Text,
} from '@chakra-ui/react'
import { CardOverlay } from 'chakra_components/CardOverlay/CardOverlay'
import { useRescueContext } from 'chakra_components/Rescue/Rescue'
import { createTimestamp, FOOD_CATEGORIES, SE_API, STATUSES } from 'helpers'
import { useApi } from 'hooks'
import { createContext, useContext, useEffect, useState } from 'react'
import { Ellipsis } from 'components'

const StopContext = createContext({})
StopContext.displayName = 'StopContext'
export const useStopContext = () => useContext(StopContext)

export function EditPickup({ stop }) {
  const { setOpenStop, openStop } = useRescueContext()
  const pickup_id = openStop && openStop.id
  // window.alert(pickup_id) // pickup = 1egzc7hep44u, delivery = 2bydwwnif9g8
  const [entryRows, setEntryRows] = useState([])
  const [notes, setNotes] = useState('')
  const { data: pickup, refresh } = useApi(
    pickup_id ? `/stops/${pickup_id}` : null
  )
  // console.log('data', pickup)

  const initFormData = {
    ...FOOD_CATEGORIES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}),
    impact_data_total_weight: 0,
    notes: '',
  }

  const [formData, setFormData] = useState(initFormData)

  useEffect(() => {
    if (pickup && pickup_id) {
      const initialEntryRows = []
      for (const category of FOOD_CATEGORIES) {
        if (pickup[category]) {
          initialEntryRows.push({
            category: category,
            weight: pickup[category],
          })
        }
      }
      setEntryRows(initialEntryRows)
      setNotes(pickup.notes)
    }
  }, [pickup, pickup_id])

  const stopContextValue = {
    stop,
    formData,
    pickup_id,
    entryRows,
    setEntryRows,
    notes,
    setNotes,
  }

  return (
    <StopContext.Provider value={stopContextValue}>
      <CardOverlay
        isOpen={!!stop}
        handleClose={() => setOpenStop(null)}
        CardHeader={EditPickupHeader}
        CardBody={EditPickupBody}
        CardFooter={EditPickupFooter}
      />
    </StopContext.Provider>
  )
}

function EditPickupHeader() {
  const { stop } = useStopContext()
  return (
    <>
      <Heading as="h2" pb={8}>
        Pickup
      </Heading>
      <Text>{stop.organization.name}</Text>
      <Text fontSize="sm" fontWeight={200} color="element.secondary" pb={4}>
        {stop.location.nickname || stop.location.address1}
      </Text>
      <Text fontSize="xs" fontWeight="light" color="element.secondary" mb="6">
        <Text fontWeight="bold">Instructions:</Text>
        {stop.location.notes}
      </Text>
      <Flex justify="space-between" gap={4}>
        <Button
          size="sm"
          flexGrow={1}
          variant="secondary"
          disabled={!stop.location.number}
        >
          {stop.location.number ? stop.location.number : 'No phone #'}
        </Button>
        <Button size="sm" flexGrow={1} variant="secondary">
          Map
        </Button>
        <Button size="sm" variant="tertiary" color="element.error">
          Cancel Pickup
        </Button>
      </Flex>
      <Divider pt={4} />
    </>
  )
}

function EditPickupBody() {
  const { entryRows, setEntryRows, notes, setNotes } = useStopContext()
  const [category, setCategory] = useState('')
  const [weight, setWeight] = useState('')

  function addEntryRow() {
    setEntryRows([...entryRows, { category, weight }])
    setCategory('')
    setWeight('')
  }

  function removeEntryRow(index) {
    if (window.confirm('Are you sure you want to remove this row?')) {
      const filtered = [...entryRows]
      filtered.splice(index, 1)
      setEntryRows(filtered)
    }
  }

  return (
    <Flex direction="column">
      {entryRows.map((row, i) => (
        <Flex key={i} justify="flex-end" gap="2" py="2">
          <Text mr="auto" textTransform="capitalize">
            {row.category.replace('impact_data_', '').replace('_', ' ')}
          </Text>
          <Text px="4" color="se.brand.primary">
            {row.weight} lbs.
          </Text>
          <IconButton
            size="xs"
            variant="tertiary"
            icon={<DeleteIcon />}
            color="element.secondary"
            onClick={() => removeEntryRow(i)}
            ml="2"
          />
        </Flex>
      ))}
      <Flex py="4">
        <Select
          size="sm"
          color="element.secondary"
          variant="flushed"
          value={category}
          onChange={e => setCategory(e.target.value)}
          textTransform="capitalize"
          mr="4"
        >
          <option>Select a category...</option>
          {FOOD_CATEGORIES.map(i => (
            <option value={i} style={{ textTransform: 'capitalize' }}>
              {i.replace('impact_data_', '').replace('_', ' ')}
            </option>
          ))}
        </Select>
        <Input
          size="sm"
          color="element.secondary"
          variant="flushed"
          type="tel"
          min="0"
          maxLength="6"
          w="28"
          value={weight}
          onChange={e => setWeight(parseInt(e.target.value) || '')}
          px="3"
          mr="1"
          textAlign="right"
        />
        <Text mr="8" pt="5px" fontSize="sm" color="element.secondary">
          lbs.
        </Text>
        <IconButton
          icon={<CheckIcon />}
          size="xs"
          borderRadius="xl"
          disabled={!category || !weight}
          onClick={addEntryRow}
        />
      </Flex>
      <Input
        size="sm"
        color="element.secondary"
        value={notes}
        placeholder="Notes..."
        variant="flushed"
        onChange={e => setNotes(e.target.value)}
      />
    </Flex>
  )
}

function EditPickupFooter() {
  // is submitting
  const { setOpenStop } = useRescueContext()
  const { entryRows, formData, notes, pickup_id, setNotes } = useStopContext()
  const total = entryRows.reduce(
    (total, current) => total + current.weight,
    formData.impact_data_total_weight
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    setIsSubmitting(true)

    for (const row of entryRows) {
      formData[row.category] = formData[row.category] + row.weight
    }
    formData.impact_data_total_weight = total
    formData.notes = notes
    await SE_API.post(`/stops/${pickup_id}/update`, {
      ...formData,
      status: STATUSES.COMPLETED,
      timestamp_logged_finish: createTimestamp(),
    })
    setIsSubmitting(false)
    setOpenStop(null)
  }

  return (
    <Button
      size="lg"
      w="100%"
      disabled={total < 1 || isSubmitting}
      onClick={handleSubmit}
    >
      {isSubmitting ? (
        <>
          Updating Pickup
          <Ellipsis />
        </>
      ) : (
        <>Complete Pickup{total ? `(${total} lbs.)` : ''}</>
      )}
    </Button>
  )
}
