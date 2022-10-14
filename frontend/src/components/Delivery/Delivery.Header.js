import { ExternalLinkIcon, PhoneIcon, WarningIcon } from '@chakra-ui/icons'
import { Button, Divider, Flex, Heading, Link, Text } from '@chakra-ui/react'
import { useRescueContext, useDeliveryContext } from 'components'
import {
  formatPhoneNumber,
  generateDirectionsLink,
  SE_API,
  STATUSES,
} from 'helpers'
import { useAuth } from 'hooks'

export function Header() {
  const { rescue, refresh, setOpenStop } = useRescueContext()
  const { delivery } = useDeliveryContext()
  const { user } = useAuth()

  async function handleCancel() {
    const reason = window.prompt(
      'Let us know why you need to cancel this delivery.\n\nNote: cancelling a delivery cannot be undone.\n'
    )
    if (reason) {
      await SE_API.post(
        `/rescues/${rescue.id}/delivery/${delivery.id}/cancel`,
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

  if (!delivery) return null
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
          {delivery.location.address1},
          {delivery.location.address2 ? `${delivery.location.address2}, ` : ''}
          {delivery.location.city}, {delivery.location.state}{' '}
          {delivery.location.zip}
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

        {delivery.status !== STATUSES.CANCELLED && (
          <Button
            size="sm"
            fontSize="xs"
            variant="secondary"
            disabled={delivery.status === STATUSES.COMPLETED}
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
