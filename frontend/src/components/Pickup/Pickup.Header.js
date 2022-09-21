import { ExternalLinkIcon, PhoneIcon, WarningIcon } from '@chakra-ui/icons'
import { Button, Divider, Flex, Heading, Link, Text } from '@chakra-ui/react'
import { useRescueContext, usePickupContext } from 'components'
import {
  formatPhoneNumber,
  generateDirectionsLink,
  SE_API,
  STATUSES,
} from 'helpers'
import { useAuth } from 'hooks'

export function PickupHeader() {
  const { openStop, refresh, setOpenStop } = useRescueContext()
  const { pickup } = usePickupContext()
  const { user } = useAuth()

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

  if (!pickup) return null
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
          {pickup.location.address1},{' '}
          {pickup.location.address2 ? `${pickup.location.address2}, ` : ''}
          {pickup.location.city}, {pickup.location.state} {pickup.location.zip}
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
