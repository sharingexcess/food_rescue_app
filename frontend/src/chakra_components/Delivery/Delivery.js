import {
  CheckIcon,
  DeleteIcon,
  ExternalLinkIcon,
  PhoneIcon,
  WarningIcon,
} from '@chakra-ui/icons'
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  Link,
  Select,
  Text,
} from '@chakra-ui/react'
import { useRescueContext, CardOverlay } from 'chakra_components'
import {
  createTimestamp,
  FOOD_CATEGORIES,
  generateDirectionsLink,
  SE_API,
  STATUSES,
  formatPhoneNumber,
} from 'helpers'
import { useApi } from 'hooks'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Ellipsis } from 'components'

const DeliveryContext = createContext({})
DeliveryContext.displayName = 'DeliveryContext'
export const useDeliveryContext = () => useContext(DeliveryContext)

export function Delivery({ delivery }) {
  const { setOpenStop, openStop, rescue } = useRescueContext()
  const [notes, setNotes] = useState('')
  const [percentTotalDropped, setPercentTotalDropped] = useState(100)

  const currentLoad = useMemo(() => {
    let weight = 0
    if (rescue) {
      for (const stop of rescue.stops) {
        if (stop.type === 'pickup') {
          weight += stop.impact_data_total_weight || 0
        } else if (stop.id === delivery?.id) {
          break
        } else {
          weight -= stop.impact_data_total_weight || 0
        }
      }
    } else return undefined
    return weight
  }, [rescue, delivery, percentTotalDropped])

  const [poundsDropped, setPoundsDropped] = useState(
    currentLoad * (percentTotalDropped / 100) || ''
  )

  useEffect(() => {
    if (delivery) {
      setNotes(delivery.notes)
      setPercentTotalDropped(delivery.percent_of_total_dropped)
      setPoundsDropped(0)
    }
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
  }

  return (
    <DeliveryContext.Provider value={deliveryContextValue}>
      <CardOverlay
        isOpen={!!delivery}
        handleClose={() => setOpenStop(null)}
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

  async function handleCancel() {
    const reason = window.prompt(
      'Let us know why you need to cancel this delivery.\n\nNote: cancelling a delivery cannot be undone.\n'
    )
    if (reason) {
      await SE_API.post(
        `/rescues/${openStop.id}/delivery/${delivery.id}/cancel`,
        {
          status: STATUSES.CANCELLED,
          notes: reason,
        }
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
            w="100%"
            variant="secondary"
            leftIcon={<ExternalLinkIcon />}
          >
            Map
          </Button>
        </Link>

        <Button
          size="sm"
          variant="secondary"
          disabled={
            openStop.status === STATUSES.CANCELLED ||
            openStop.status === STATUSES.COMPLETED
          }
          color="yellow.primary"
          bg="yellow.secondary"
          onClick={handleCancel}
          flexGrow={1}
          leftIcon={<WarningIcon />}
        >
          Cancel Delivery
        </Button>
      </Flex>
      <Divider pt={4} />
    </>
  )
}

function DeliveryBody() {
  const {
    currentLoad,
    poundsDropped,
    setPoundsDropped,
    percentTotalDropped,
    setPercentTotalDropped,
  } = useDeliveryContext()

  return (
    <Flex direction="column" align="center">
      <Text>You have {currentLoad} lbs. from your rescue</Text>
      <Text fontSize="lg" mb="4">
        Amount Received
      </Text>
      <Flex>
        <Input
          h="90px"
          w="250px"
          fontSize="6xl"
          color="element.primary"
          variant="flushed"
          type="tel"
          min="0"
          maxLength="6"
          value={poundsDropped}
          onChange={e => setPoundsDropped(parseInt(e.target.value) || '')}
          textAlign="right"
        />
        <Text ml="4px" fontSize="6xl">
          lbs.
        </Text>
      </Flex>
      <Flex wrap="wrap" justify="space-around" w="100%">
        <Text fontWeight="bold">{percentTotalDropped}%</Text>
        <Slider
          aria-label="slider-ex-1"
          colorScheme="green"
          defaultValue={percentTotalDropped}
          h="12"
          maxW="500px"
          onChange={value => setPercentTotalDropped(value)}
        >
          <SliderTrack h="2" borderRadius="4px">
            <SliderFilledTrack h="2" borderRadius="4px" />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Flex>
    </Flex>
  )
}

function DeliveryFooter() {
  const { setOpenStop, refresh } = useRescueContext()
  const { notes, delivery, poundsDropped } = useDeliveryContext()

  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    setIsSubmitting(true)

    const formData = {
      ...FOOD_CATEGORIES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}),
      impact_data_total_weight: 0,
      notes: '',
    }

    formData.impact_data_total_weight = total
    formData.notes = notes
    await SE_API.post(`/stops/${delivery.id}/update`, {
      ...formData,
      status: STATUSES.COMPLETED,
      timestamp_logged_finish: createTimestamp(),
    })
    sessionStorage.removeItem(session_storage_key)
    setIsSubmitting(false)
    setOpenStop(null)
    refresh()
  }

  return (
    <Flex direction="column" w="100%">
      <Button
        size="lg"
        w="100%"
        disabled={poundsDropped < 1 || isSubmitting}
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
