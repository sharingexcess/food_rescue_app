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
import { useRescueContext, useCollectionContext } from 'components'
import {
  formatPhoneNumber,
  generateDirectionsLink,
  SE_API,
  STATUSES,
} from 'helpers'
import { useAuth } from 'hooks'
import moment from 'moment'

export function CollectionHeader() {
  const { refresh, setOpenTransfer } = useRescueContext()
  const { collection, completedAt, setCompletedAt } = useCollectionContext()
  const { user } = useAuth()

  async function handleCancel() {
    const reason = window.prompt(
      'Let us know why you need to cancel this collection.\n\nNote: cancelling a collection cannot be undone.\n'
    )
    if (reason) {
      await SE_API.post(
        `/transfers/cancel/${collection.id}`,
        {
          notes: 'Cancelled - ' + reason,
        },
        user.accessToken
      )
      setOpenTransfer(null)
      refresh()
    }
  }

  if (!collection) return null
  return (
    <>
      <Heading as="h2" mb="6" size="2xl">
        Collection
      </Heading>
      <Heading as="h4" size="md" fontWeight="600">
        {collection.organization.name}
      </Heading>
      {collection.location.nickname && (
        <Text fontSize="sm" fontWeight={300} color="element.secondary">
          {collection.location.nickname}
        </Text>
      )}
      <Link
        href={generateDirectionsLink(
          collection.location.address1,
          collection.location.city,
          collection.location.state,
          collection.location.zip
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
          {collection.location.address1},{' '}
          {collection.location.address2
            ? `${collection.location.address2}, `
            : ''}
          {collection.location.city}, {collection.location.state}{' '}
          {collection.location.zip}
        </Text>
      </Link>
      {[STATUSES.ACTIVE, STATUSES.SCHEDULED].includes(collection.status) &&
        collection.location.notes && (
          <Text
            fontSize="xs"
            fontWeight="light"
            color="element.secondary"
            mb="4"
          >
            <Text as="span" fontWeight="bold">
              Instructions:{' '}
            </Text>
            {collection.location.notes}
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
          disabled={!collection.location.contact_phone}
          leftIcon={<PhoneIcon />}
        >
          {collection.location.contact_phone ? (
            <a href={`tel:+${collection.location.contact_phone}`}>
              {formatPhoneNumber(collection.location.contact_phone)}
            </a>
          ) : (
            'No Phone'
          )}
        </Button>

        <Link
          href={generateDirectionsLink(
            collection.location.address1,
            collection.location.city,
            collection.location.state,
            collection.location.zip
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

        {collection.status !== STATUSES.CANCELLED && (
          <Button
            size="sm"
            fontSize="xs"
            variant="secondary"
            disabled={collection.status === STATUSES.COMPLETED}
            color="yellow.primary"
            bg="yellow.secondary"
            onClick={handleCancel}
            flexGrow={1}
            leftIcon={<WarningIcon />}
          >
            Cancel Collection
          </Button>
        )}
      </Flex>
      <Divider pt={4} />
    </>
  )
}
