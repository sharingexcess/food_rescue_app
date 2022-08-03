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
import { FOOD_CATEGORIES } from 'helpers'
import { createContext, useContext, useState } from 'react'

const StopContext = createContext({})
StopContext.displayName = 'StopContext'
export const useStopContext = () => useContext(StopContext)

export function EditPickup({ stop }) {
  const { setOpenStop } = useRescueContext()
  const [entryRows, setEntryRows] = useState([])

  const stopContextValue = { stop, entryRows, setEntryRows }

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
  const { entryRows, setEntryRows } = useStopContext()
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
        <Flex justify="flex-end" gap="2" py="2">
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
    </Flex>
  )
  /*
  button and form control to add another impact category
  after submitting form, make text component from form submission and push it to box
  box displays all submitted impact categories
  */
}

function EditPickupFooter() {
  const { entryRows } = useStopContext()

  const total = entryRows.reduce((total, current) => total + current.weight, 0)

  return (
    <Button size="lg" w="100%" disabled={total < 1}>
      Complete Pickup{total ? ` (${total} lbs.)` : ''}
    </Button>
  )
}
