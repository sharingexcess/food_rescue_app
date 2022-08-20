import {
  CheckIcon,
  DeleteIcon,
  EditIcon,
  ExternalLinkIcon,
  PhoneIcon,
  WarningIcon,
} from '@chakra-ui/icons'
import {
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Select,
  Text,
} from '@chakra-ui/react'
import { CardOverlay, useRescueContext } from 'chakra_components'
import {
  createTimestamp,
  FOOD_CATEGORIES,
  generateDirectionsLink,
  SE_API,
  STATUSES,
  formatPhoneNumber,
} from 'helpers'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from 'hooks'

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
    window.sessionStorage.removeItem(session_storage_key)
    setOpenStop(null)
  }

  function verifyClose() {
    if (isChanged) {
      return window.confirm(
        'You have unsaved changes on this pickup. Are you sure you want to exit?'
      )
    } else return true
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
        closeHandler={handleClosePickup}
        preCloseHandler={verifyClose}
        CardHeader={PickupHeader}
        CardBody={PickupBody}
        CardFooter={PickupFooter}
      />
    </PickupContext.Provider>
  )
}

export function PickupHeader() {
  const { openStop, refresh, setOpenStop } = useRescueContext()
  const { pickup } = usePickupContext()
  const { user, hasAdminPermission } = useAuth()

  async function handleCancel() {
    const reason = window.prompt(
      'Let us know why you need to cancel this pickup.\n\nNote: cancelling a pickup cannot be undone.\n'
    )
    if (reason) {
      await SE_API.post(
        `/rescues/${openStop.id}/pickup/${pickup.id}/cancel`,
        {
          status: STATUSES.CANCELLED,
          notes: 'Cancelled - ' + reason,
        },
        user.accessToken
      )
      setOpenStop(null)
      refresh()
    }
  }
  return (
    <>
      <Heading as="h2" mb="6" size="2xl">
        Pickup
      </Heading>
      <Heading as="h4" size="md" fontWeight="600">
        {pickup.organization.name}
      </Heading>
      {pickup.location.nickname && (
        <Text fontSize="sm" fontWeight={300} color="element.secondary">
          {pickup.location.nickname}
        </Text>
      )}
      <Link
        href={generateDirectionsLink(
          pickup.location.address1,
          pickup.location.city,
          pickup.location.state,
          pickup.location.zip
        )}
        isExternal
      >
        <Text
          fontSize="sm"
          fontWeight={300}
          color="element.active"
          textDecoration="underline"
          mb="4"
        >
          {pickup.location.address1}, {pickup.location.city},{' '}
          {pickup.location.state} {pickup.location.zip}
        </Text>
      </Link>
      {pickup.location.notes && (
        <Text fontSize="xs" fontWeight="light" color="element.secondary" mb="4">
          <Text as="span" fontWeight="bold">
            Instructions:{' '}
          </Text>
          {pickup.location.notes}
        </Text>
      )}
      <Flex justify="space-between" gap={2}>
        <Button
          size="sm"
          fontSize="xs"
          flexGrow={1}
          variant="secondary"
          disabled={!pickup.location.contact_phone}
          leftIcon={<PhoneIcon />}
        >
          {pickup.location.contact_phone ? (
            <a href={`tel:+${pickup.location.contact_phone}`}>
              {formatPhoneNumber(pickup.location.contact_phone)}
            </a>
          ) : (
            'No Phone'
          )}
        </Button>

        <Link
          href={generateDirectionsLink(
            pickup.location.address1,
            pickup.location.city,
            pickup.location.state,
            pickup.location.zip
          )}
          isExternal
          textDecoration="none !important"
          flexGrow={1}
        >
          <Button
            size="sm"
            fontSize="xs"
            w="100%"
            variant="secondary"
            leftIcon={<ExternalLinkIcon />}
          >
            Map
          </Button>
        </Link>

        {openStop.status !== STATUSES.CANCELLED && (
          <Button
            size="sm"
            fontSize="xs"
            variant="secondary"
            disabled={openStop.status === STATUSES.COMPLETED}
            color="yellow.primary"
            bg="yellow.secondary"
            onClick={handleCancel}
            flexGrow={1}
            leftIcon={<WarningIcon />}
          >
            Cancel Pickup
          </Button>
        )}
      </Flex>
      <Divider pt={4} />
    </>
  )
}

function SubmittedEntryRows({ entryRows }) {
  const { setEntryRows, session_storage_key, notes } = usePickupContext()

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

  return (
    <>
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
    </>
  )
}

function EntryRowInput() {
  const { entryRows, setEntryRows, session_storage_key, notes } =
    usePickupContext()
  const [category, setCategory] = useState('')
  const [weight, setWeight] = useState('')

  function addEntryRow() {
    const updatedEntryRows = [...entryRows, { category, weight }]
    setEntryRows(updatedEntryRows)

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

  return (
    <Flex my="4">
      <Select
        size="sm"
        color="element.secondary"
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
  )
}

export function NoteInput() {
  const { openStop } = useRescueContext()
  const { notes, session_storage_key, entryRows, setNotes } = usePickupContext()

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

  return openStop.status === STATUSES.CANCELLED ? (
    <Flex align="center" my="4">
      <EditIcon mr="4" color="element.tertiary" />
      <Text fontSize="sm" color="element.secondary">
        {openStop.notes}
      </Text>
    </Flex>
  ) : (
    <InputGroup>
      <InputLeftElement
        pointerEvents="none"
        children={<EditIcon mb="3" color="element.tertiary" />}
      />
      <Input
        size="sm"
        color="element.secondary"
        value={notes || ''}
        placeholder="Add notes to this pickup..."
        readOnly={openStop.status === STATUSES.CANCELLED}
        onChange={e => handleNotesChange(e.target.value)}
        mb="4"
      />
    </InputGroup>
  )
}

function PickupBody() {
  const { entryRows } = usePickupContext()
  const { openStop, rescue } = useRescueContext()

  return (
    <Flex direction="column">
      {openStop.status === STATUSES.SCHEDULED ? (
        <Flex direction="column" align="center" w="100%" py="8">
          <Heading as="h4" size="md" color="element.primary" mb="2">
            This pickup isn't active yet.
          </Heading>
          <Text align="center" fontSize="sm" color="element.secondary">
            {rescue.status === STATUSES.ACTIVE
              ? 'You can enter data here once you complete all previous stops along your rescue.'
              : 'Ready to go? Start this rescue to begin entering data.'}
          </Text>
        </Flex>
      ) : openStop.status === STATUSES.CANCELLED ? (
        <Flex direction="column" align="center" w="100%" py="8">
          <Heading as="h4" size="md" color="element.primary" mb="2">
            This pickup has been cancelled.
          </Heading>
        </Flex>
      ) : (
        <>
          <SubmittedEntryRows entryRows={entryRows} />
          <EntryRowInput />
        </>
      )}
    </Flex>
  )
}

export function PickupFooter() {
  const { user } = useAuth()
  const { setOpenStop, refresh } = useRescueContext()
  const { entryRows, notes, pickup, session_storage_key, isChanged } =
    usePickupContext()
  const total = entryRows.reduce((total, current) => total + current.weight, 0)

  const [isSubmitting, setIsSubmitting] = useState(false)

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
    await SE_API.post(
      `/stops/${pickup.id}/update`,
      {
        ...formData,
        status: STATUSES.COMPLETED,
        timestamp_logged_finish: createTimestamp(),
      },
      user.accessToken
    )
    sessionStorage.removeItem(session_storage_key)
    setIsSubmitting(false)
    setOpenStop(null)
    refresh()
  }

  return (
    <Flex direction="column" w="100%">
      {pickup.status !== STATUSES.SCHEDULED && <NoteInput />}
      <Button
        size="lg"
        w="100%"
        disabled={
          total < 1 ||
          isSubmitting ||
          !isChanged ||
          !(rescue.handler_id === user.id || hasAdminPermission)
        }
        onClick={handleSubmit}
        isLoading={isSubmitting}
        loadingText="Updating Pickup"
      >
        {pickup.status === 'completed' ? 'Update' : 'Complete'} Pickup
        {total ? ` (${total} lbs.)` : ''}
      </Button>
    </Flex>
  )
}
