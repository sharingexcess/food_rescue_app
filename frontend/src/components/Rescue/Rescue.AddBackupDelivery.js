import { Select, Heading, Flex, Text, Link, Button } from '@chakra-ui/react'
import { Autocomplete, useRescueContext } from 'components'
import {
  EMPTY_CATEGORIZED_WEIGHT,
  SE_API,
  STATUSES,
  TRANSFER_TYPES,
} from 'helpers'
import { useEffect, useMemo, useState } from 'react'
import { useApi, useAuth } from 'hooks'

export function AddBackupDelivery() {
  const { data: organizations } = useApi(
    '/organizations/list',
    useMemo(() => ({ type: 'recipient' }), [])
  )
  const { rescue, refresh } = useRescueContext()
  const { user } = useAuth()
  const [organization, setOrganization] = useState()
  const [location, setLocation] = useState()
  const [isWorking, setIsWorking] = useState()

  useEffect(() => {
    if (organization && organization.locations.length === 1) {
      setLocation(organization.locations[0])
    }
  }, [organization])

  function handleSearchForOrganization(value) {
    return organizations
      .filter(i => i.locations?.length)
      .filter(i => i.type === 'recipient')
      .filter(i => i.name.toLowerCase().includes(value.toLowerCase()))
  }

  async function handleAddBackupDelivery() {
    setIsWorking(true)
    const new_transfer = await SE_API.post(
      `/transfers/create`,
      {
        type: TRANSFER_TYPES.DISTRIBUTION,
        status: STATUSES.SCHEDULED,
        rescue_id: rescue.id,
        handler_id: rescue.handler_id,
        organization_id: organization.id,
        location_id: location.id,
        notes: '',
        timestamp_completed: null,
        total_weight: 0,
        categorized_weight: EMPTY_CATEGORIZED_WEIGHT(),
      },
      user.accessToken
    )
    await SE_API.post(
      `/rescues/update/${rescue.id}`,
      {
        id: rescue.id,
        type: rescue.type,
        status: STATUSES.ACTIVE,
        handler_id: rescue.handler_id,
        notes: rescue.notes,
        timestamp_scheduled: rescue.timestamp_scheduled,
        timestamp_completed: null,
        transfer_ids: [...rescue.transfers.map(i => i.id), new_transfer.id],
      },
      user.accessToken
    )
    refresh()
  }

  return (
    <Flex
      direction="column"
      px="4"
      pt="2"
      pb="4"
      my="3"
      bg="surface.card"
      boxShadow="md"
      borderRadius="md"
    >
      <Heading
        as="h6"
        fontWeight="600"
        fontSize="md"
        color="element.primary"
        my="2"
      >
        Add an Extra Delivery
      </Heading>
      <Text fontSize="xs" color="element.secondary" mb="4">
        Looks like you have some more food left over! Search for a recipient
        here to make one final delivery.
      </Text>
      <Text fontSize="xs" color="element.secondary" mb="4">
        Need help? You can always reach out to the team at SE on the{' '}
        <Link href="/help" color="blue.primary" textDecoration="underline">
          help page
        </Link>
        .
      </Text>
      <Autocomplete
        placeholder="Recipient Organization..."
        value={organization}
        setValue={setOrganization}
        handleChange={value => handleSearchForOrganization(value)}
        displayField="name"
      />
      {organization && (
        <Select
          fontSize="sm"
          my="2"
          placeholder="Choose a location..."
          value={location?.id}
          onChange={e =>
            setLocation(
              organization.locations.find(i => i.id === e.target.value)
            )
          }
        >
          {organization.locations?.map(i => (
            <option value={i.id} key={i.id}>
              {i.nickname ? `${i.nickname} (${i.address1})` : i.address1}
            </option>
          ))}
        </Select>
      )}
      <Button
        size="lg"
        w="100%"
        isLoading={isWorking}
        loadingText="Adding Delivery..."
        onClick={handleAddBackupDelivery}
        disabled={!location || !organization || isWorking}
        mt="4"
      >
        Add Delivery
      </Button>
    </Flex>
  )
}
