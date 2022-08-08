import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createTimestamp, FOOD_CATEGORIES, SE_API, STATUSES } from 'helpers'
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
import { CardOverlay, useRescueContext } from 'chakra_components'
import { CheckIcon, DeleteIcon } from '@chakra-ui/icons'
import { Ellipsis } from 'components'

const PickupContext = createContext({})
PickupContext.displayName = 'PickupContext'
export const usePickupContext = () => useContext(PickupContext)

export function Pickup({ pickup }) {
  const { setOpenStop } = useRescueContext()
  const [entryRows, setEntryRows] = useState([])
  const [notes, setNotes] = useState('')
  const session_storage_key = useMemo(
    () => (pickup ? `pickup_cache_${pickup.id}` : undefined),
    [pickup]
  )
  const isChanged = window.sessionStorage.getItem(session_storage_key)

  useEffect(() => {
    const sessionObject = sessionStorage.getItem(session_storage_key)

    if (sessionObject) {
      const { sessionEntryRows, sessionNotes } = JSON.parse(sessionObject)
      setEntryRows(sessionEntryRows)
      setNotes(sessionNotes)
    } else if (pickup) {
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
  }, [pickup])

  function handleClosePickup() {
    if (isChanged) {
      if (
        window.confirm(
          'You have unsaved changes on this pickup. Are you sure you want to exit?'
        )
      ) {
        window.sessionStorage.removeItem(session_storage_key)
        setOpenStop(null)
      } else return
    } else setOpenStop(null)
  }

  const pickupContextValue = {
    pickup,
    entryRows,
    setEntryRows,
    notes,
    setNotes,
    session_storage_key,
    isChanged,
  }

  return (
    <PickupContext.Provider value={pickupContextValue}>
      <CardOverlay
        isOpen={!!pickup}
        handleClose={handleClosePickup}
        CardHeader={PickupHeader}
        CardBody={PickupBody}
        CardFooter={PickupFooter}
      />
    </PickupContext.Provider>
  )
}

export function PickupHeader() {
  const { pickup } = usePickupContext()
  return (
    <>
      <Heading as="h2" pb={8}>
        Pickup
      </Heading>
      <Text>{pickup.organization.name}</Text>
      <Text fontSize="sm" fontWeight={200} color="element.secondary" pb={4}>
        {pickup.location.nickname || pickup.location.address1}
      </Text>
      <Text fontSize="xs" fontWeight="light" color="element.secondary" mb="6">
        <Text as="span" fontWeight="bold">
          Instructions:{' '}
        </Text>
        {pickup.location.notes}
      </Text>
      <Flex justify="space-between" gap={4}>
        <Button
          size="sm"
          flexGrow={1}
          variant="secondary"
          disabled={!pickup.location.number}
        >
          {pickup.location.number ? pickup.location.number : 'No phone #'}
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

function PickupBody() {
  const { entryRows, setEntryRows, notes, setNotes, session_storage_key } =
    usePickupContext()
  const [category, setCategory] = useState('')
  const [weight, setWeight] = useState('')

  function addEntryRow() {
    const updatedEntryRows = [...entryRows, { category, weight }]
    setEntryRows(updatedEntryRows)

    session_storage_key &&
      sessionStorage.setItem(
        session_storage_key,
        JSON.stringify({
          sessionEntryRows: updatedEntryRows,
          sessionNotes: notes,
        })
      )

    setCategory('')
    setWeight('')
  }

  function removeEntryRow(index) {
    if (window.confirm('Are you sure you want to remove this row?')) {
      const filtered = [...entryRows]
      filtered.splice(index, 1)
      setEntryRows(filtered)

      session_storage_key &&
        sessionStorage.setItem(
          session_storage_key,
          JSON.stringify({
            sessionEntryRows: filtered,
            sessionNotes: notes,
          })
        )
    }
  }

  function handleNotesChange(value) {
    setNotes(value)

    session_storage_key &&
      sessionStorage.setItem(
        session_storage_key,
        JSON.stringify({
          sessionEntryRows: entryRows,
          sessionNotes: value,
        })
      )
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
          value={category || ''}
          onChange={e => setCategory(e.target.value)}
          textTransform="capitalize"
          mr="4"
        >
          <option>Select a category...</option>
          {FOOD_CATEGORIES.map(i => (
            <option key={i} value={i} style={{ textTransform: 'capitalize' }}>
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
          value={weight || ''}
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
        value={notes || ''}
        placeholder="Notes..."
        variant="flushed"
        onChange={e => handleNotesChange(e.target.value)}
      />
    </Flex>
  )
}

export function PickupFooter() {
  const { setOpenStop } = useRescueContext()
  const { entryRows, notes, pickup, session_storage_key, isChanged } =
    usePickupContext()
  const total = entryRows.reduce((total, current) => total + current.weight, 0)

  const [isSubmitting, setIsSubmitting] = useState(false)
  console.log(window.sessionStorage.getItem(session_storage_key))

  async function handleSubmit() {
    setIsSubmitting(true)

    const formData = {
      ...FOOD_CATEGORIES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}),
      impact_data_total_weight: 0,
      notes: '',
    }

    for (const row of entryRows) {
      formData[row.category] = formData[row.category] + row.weight
    }
    formData.impact_data_total_weight = total
    formData.notes = notes
    await SE_API.post(`/stops/${pickup.id}/update`, {
      ...formData,
      status: STATUSES.COMPLETED,
      timestamp_logged_finish: createTimestamp(),
    })
    sessionStorage.removeItem(session_storage_key)
    setIsSubmitting(false)
    setOpenStop(null)
  }

  return (
    <Button
      size="lg"
      w="100%"
      disabled={total < 1 || isSubmitting || !isChanged}
      onClick={handleSubmit}
    >
      {isSubmitting ? (
        <>
          Updating Pickup
          <Ellipsis />
        </>
      ) : (
        <>
          {pickup.status === 'completed' ? 'Update' : 'Complete'} Pickup
          {total ? ` (${total} lbs.)` : ''}
        </>
      )}
    </Button>
  )
}
