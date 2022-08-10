import {
  EditIcon,
  ExternalLinkIcon,
  PhoneIcon,
  WarningIcon,
} from '@chakra-ui/icons'
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Button,
  Divider,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Text,
} from '@chakra-ui/react'
import { useRescueContext, CardOverlay } from 'chakra_components'
import {
  createTimestamp,
  generateDirectionsLink,
  SE_API,
  STATUSES,
  formatPhoneNumber,
} from 'helpers'
import { useAuth } from 'hooks'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
// import { NoteInput } from 'chakra_components/Pickup/Pickup'
import { Ellipsis } from 'components'
import { calculateCurrentLoad } from './Delivery.utils'

const DeliveryContext = createContext({})
DeliveryContext.displayName = 'DeliveryContext'
export const useDeliveryContext = () => useContext(DeliveryContext)

export function Delivery({ delivery }) {
  const { admin } = useAuth()
  const { setOpenStop, rescue } = useRescueContext()
  const [notes, setNotes] = useState('')
  const [percentTotalDropped, setPercentTotalDropped] = useState(100)
  const currentLoad = useMemo(
    () => calculateCurrentLoad(rescue, delivery),
    [rescue, delivery]
  )
  const [poundsDropped, setPoundsDropped] = useState(currentLoad)

  useEffect(() => {
    if (delivery && currentLoad) {
      setNotes(delivery.notes)
      setPercentTotalDropped(parseInt(delivery.percent_of_total_dropped))
      setPoundsDropped(
        parseInt(currentLoad * (delivery.percent_of_total_dropped / 100))
      )
    }
  }, [delivery, currentLoad])

  const canEdit = useMemo(() => {
    return ![STATUSES.CANCELLED, STATUSES.SCHEDULED].includes(delivery?.status)
  }, [delivery])

  const deliveryContextValue = {
    delivery,
    notes,
    setNotes,
    percentTotalDropped,
    setPercentTotalDropped,
    poundsDropped,
    setPoundsDropped,
    currentLoad,
    canEdit,
  }

  return (
    <DeliveryContext.Provider value={deliveryContextValue}>
      <CardOverlay
        isOpen={!!delivery}
        closeHandler={() => setOpenStop(null)}
        CardHeader={DeliveryHeader}
        CardBody={DeliveryBody}
        CardFooter={DeliveryFooter}
      />
    </DeliveryContext.Provider>
  )
}

function DeliveryHeader() {
  const { openStop, refresh, setOpenStop } = useRescueContext()
  const { delivery } = useDeliveryContext()
  const { user } = useAuth()

  async function handleCancel() {
    const reason = window.prompt(
      'Let us know why you need to cancel this delivery.\n\nNote: cancelling a delivery cannot be undone.\n'
    )
    if (reason) {
      await SE_API.post(
        `/rescues/${openStop.id}/delivery/${delivery.id}/cancel`,
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
        Delivery
      </Heading>
      <Heading as="h4" size="md" fontWeight="600">
        {delivery.organization.name}
      </Heading>
      {delivery.location.nickname && (
        <Text fontSize="sm" fontWeight={300} color="element.secondary">
          {delivery.location.nickname}
        </Text>
      )}
      <Link
        href={generateDirectionsLink(
          delivery.location.address1,
          delivery.location.city,
          delivery.location.state,
          delivery.location.zip
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
          {delivery.location.address1}, {delivery.location.city},{' '}
          {delivery.location.state} {delivery.location.zip}
        </Text>
      </Link>
      {delivery.location.notes && (
        <Text fontSize="xs" fontWeight="light" color="element.secondary" mb="4">
          <Text as="span" fontWeight="bold">
            Instructions:{' '}
          </Text>
          {delivery.location.notes}
        </Text>
      )}
      <Flex justify="space-between" gap={2}>
        <Button
          size="sm"
          fontSize="xs"
          flexGrow={1}
          variant="secondary"
          disabled={!delivery.location.contact_phone}
          leftIcon={<PhoneIcon />}
        >
          {delivery.location.contact_phone ? (
            <a href={`tel:+${delivery.location.contact_phone}`}>
              {formatPhoneNumber(delivery.location.contact_phone)}
            </a>
          ) : (
            'No Phone'
          )}
        </Button>

        <Link
          href={generateDirectionsLink(
            delivery.location.address1,
            delivery.location.city,
            delivery.location.state,
            delivery.location.zip
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
            Cancel Delivery
          </Button>
        )}
      </Flex>
      <Divider pt={4} />
    </>
  )
}

function DeliveryBody() {
  const { setOpenStop, rescue } = useRescueContext()
  const {
    delivery,
    currentLoad,
    poundsDropped,
    setPoundsDropped,
    percentTotalDropped,
    setPercentTotalDropped,
  } = useDeliveryContext()

  // create an internal copy of poundsDropped
  // so that we don't unfocus the input on change
  // due to the parent component re-rendering
  const [tempInputValue, setTempInputValue] = useState(poundsDropped)

  // update the internal copy whenever the external state value updates
  useEffect(() => setTempInputValue(poundsDropped), [poundsDropped])

  async function handlePoundsInputChange() {
    const updatedPoundsDropped = Math.min(
      Math.max(parseInt(tempInputValue) || 0, 0),
      currentLoad
    )
    setTempInputValue(updatedPoundsDropped)
    setPoundsDropped(updatedPoundsDropped)
    setPercentTotalDropped(
      Math.round((updatedPoundsDropped / currentLoad) * 100)
    )
  }

  async function handleChangeSlider(value) {
    setPercentTotalDropped(value)
    setPoundsDropped(Math.round((value / 100) * currentLoad))
  }

  return delivery.status === STATUSES.SCHEDULED ? (
    <Flex direction="column" align="center" w="100%" py="8">
      <Heading as="h4" size="md" color="element.primary" mb="2">
        This delivery isn't active yet.
      </Heading>
      <Text align="center" fontSize="sm" color="element.secondary">
        {rescue.status === STATUSES.ACTIVE
          ? 'You can enter data here once you complete all previous stops along your rescue.'
          : 'Ready to go? Start this rescue to begin entering data.'}
      </Text>
    </Flex>
  ) : delivery.status === STATUSES.CANCELLED ? (
    <Flex direction="column" align="center" w="100%" py="8">
      <Heading as="h4" size="md" color="element.primary" mb="2">
        This delivery has been cancelled.
      </Heading>
    </Flex>
  ) : (
    <Flex direction="column" align="center">
      <Text textAlign="center" fontWeight={400} mb={4}>
        How much of your current load
        <br />
        <Text as="span" fontWeight={600}>
          ({currentLoad} lbs.)
        </Text>{' '}
        are you delivering?
      </Text>
      <Flex>
        <Input
          w="96px"
          h="64px"
          fontSize="4xl"
          fontWeight="bold"
          color="element.primary"
          variant="flushed"
          type="number"
          min="0"
          max={currentLoad}
          value={tempInputValue}
          onChange={e => setTempInputValue(e.target.value)}
          onBlur={() => handlePoundsInputChange()}
          textAlign="right"
          py="2"
        />
        <Text fontSize="3xl" fontWeight="bold" ml="3" mt="2">
          lbs.
        </Text>
      </Flex>
      <Flex justify="start" w="100%" gap={4} align="center" mt={8} maxW="500px">
        <Text w="48px" fontWeight="bold">
          {percentTotalDropped}%
        </Text>
        <Slider
          aria-label="slider-ex-1"
          colorScheme="green"
          defaultValue={percentTotalDropped}
          value={percentTotalDropped}
          onChange={handleChangeSlider}
          flexGrow={1}
        >
          <SliderTrack h="2" borderRadius="4px">
            <SliderFilledTrack h="2" borderRadius="4px" />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Flex>
      {currentLoad === 0 && (
        <Flex direction="column" justify="center">
          <Text textAlign="center" fontSize="xs">
            You have nothing to deliver! If this is by accident
          </Text>
          <Button
            variant="tertiary"
            fontSize="xs"
            onClick={() => setOpenStop(null)}
          >
            you can always update your previous deliveries
          </Button>
        </Flex>
      )}
    </Flex>
  )
}

function NoteInput() {
  const { openStop } = useRescueContext()
  const { notes, setNotes } = useDeliveryContext()

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
        placeholder="Add notes to this delivery..."
        variant="flushed"
        readOnly={openStop.status === STATUSES.CANCELLED}
        onChange={e => setNotes(e.target.value)}
        mb="4"
      />
    </InputGroup>
  )
}

function DeliveryFooter() {
  const { setOpenStop, refresh } = useRescueContext()
  const { notes, delivery, canEdit, percentTotalDropped } = useDeliveryContext()
  const { user } = useAuth()

  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    setIsSubmitting(true)
    const payload = {
      percent_of_total_dropped: percentTotalDropped,
      notes: notes,
      timestamp_logged_finish:
        delivery?.timestamp_logged_finish || createTimestamp(),
      timestamp_updated: createTimestamp(),
      status: STATUSES.COMPLETED,
    }
    await SE_API.post(`/stops/${delivery.id}/update`, payload, user.accessToken)
    setIsSubmitting(false)
    setOpenStop(null)
    refresh()
  }

  return (
    <Flex direction="column" w="100%">
      {delivery.status !== STATUSES.SCHEDULED && <NoteInput />}
      <Button
        size="lg"
        w="100%"
        disabled={!canEdit}
        isLoading={isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? (
          <>
            Updating Delivery
            <Ellipsis />
          </>
        ) : (
          <>
            {delivery.status === 'completed' ? 'Update' : 'Complete'} Delivery
          </>
        )}
      </Button>
    </Flex>
  )
}
