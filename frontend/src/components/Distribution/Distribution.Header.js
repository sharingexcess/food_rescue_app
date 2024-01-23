import { ExternalLinkIcon, PhoneIcon, WarningIcon } from '@chakra-ui/icons'
import {
  Button,
  Divider,
  Flex,
  Heading,
  Input,
  Link,
  Text,
} from '@chakra-ui/react'
import { useRescueContext, useDistributionContext } from 'components'
import {
  formatPhoneNumber,
  generateDirectionsLink,
  SE_API,
  STATUSES,
} from 'helpers'
import { useAuth } from 'hooks'
import moment from 'moment'

export function Header() {
  const { refresh, setOpenTransfer } = useRescueContext()
  const { distribution, completedAt, setCompletedAt } = useDistributionContext()
  const { user } = useAuth()

  async function handleCancel() {
    const reason = window.prompt(
      'Let us know why you need to cancel this distribution.\n\nNote: cancelling a distribution cannot be undone.\n'
    )
    if (reason) {
      await SE_API.post(
        `/transfers/cancel/${distribution.id}`,
        {
          notes: 'Cancelled - ' + reason,
        },
        user.accessToken
      )
      setOpenTransfer(null)
      refresh()
    }
  }

  if (!distribution) return null
  return (
    <>
      <Heading as="h2" mb="6" size="2xl">
        Distribution
      </Heading>
      <Heading as="h4" size="md" fontWeight="600">
        {distribution.organization.name}
      </Heading>
      {distribution.location.nickname && (
        <Text fontSize="sm" fontWeight={300} color="element.secondary">
          {distribution.location.nickname}
        </Text>
      )}
      <Link
        href={generateDirectionsLink(
          distribution.location.address1,
          distribution.location.city,
          distribution.location.state,
          distribution.location.zip
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
          {distribution.location.address1},{' '}
          {distribution.location.address2
            ? `${distribution.location.address2}, `
            : ''}
          {distribution.location.city}, {distribution.location.state}{' '}
          {distribution.location.zip}
        </Text>
      </Link>
      {[STATUSES.ACTIVE, STATUSES.SCHEDULED].includes(distribution.status) &&
        distribution.location.notes && (
          <Text
            fontSize="xs"
            fontWeight="light"
            color="element.secondary"
            mb="4"
          >
            <Text as="span" fontWeight="bold">
              Instructions:{' '}
            </Text>
            {distribution.location.notes}
          </Text>
        )}
      <>
        <Text
          color="element.tertiary"
          fontSize="xs"
          fontWeight="700"
          textTransform="uppercase"
        >
          Completed at:
        </Text>
        <Input
          placeholder="Completed at"
          mb={4}
          type="datetime-local"
          value={moment(completedAt).format('YYYY-MM-DDTHH:mm')}
          onChange={e => setCompletedAt(new Date(e.target.value))}
        />
      </>
      <Flex justify="space-between" gap={2}>
        <Button
          size="sm"
          fontSize="xs"
          flexGrow={1}
          variant="secondary"
          disabled={!distribution.location.contact_phone}
          leftIcon={<PhoneIcon />}
        >
          {distribution.location.contact_phone ? (
            <a href={`tel:+${distribution.location.contact_phone}`}>
              {formatPhoneNumber(distribution.location.contact_phone)}
            </a>
          ) : (
            'No Phone'
          )}
        </Button>

        <Link
          href={generateDirectionsLink(
            distribution.location.address1,
            distribution.location.city,
            distribution.location.state,
            distribution.location.zip
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

        {distribution.status !== STATUSES.CANCELLED && (
          <Button
            size="sm"
            fontSize="xs"
            variant="secondary"
            disabled={distribution.status === STATUSES.COMPLETED}
            color="yellow.primary"
            bg="yellow.secondary"
            onClick={handleCancel}
            flexGrow={1}
            leftIcon={<WarningIcon />}
          >
            Cancel Distribution
          </Button>
        )}
      </Flex>
      <Divider pt={4} />
    </>
  )
}
