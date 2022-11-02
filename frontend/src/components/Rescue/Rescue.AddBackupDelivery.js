import { Select, Heading, Flex, Text, Link, Button } from '@chakra-ui/react'
import { Autocomplete, useRescueContext } from 'components'
import { createTimestamp, generateUniqueId, SE_API, STATUSES } from 'helpers'
import { useEffect, useMemo, useState } from 'react'
import { useApi, useAuth } from 'hooks'

export function AddBackupDelivery() {
  const { data: organizations } = useApi(
    '/organizations',
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
    console.log(value, organizations)
    return organizations
      .filter(i => i.locations?.length)
      .filter(i => i.type === 'recipient')
      .filter(i => i.name.toLowerCase().includes(value.toLowerCase()))
  }

  async function handleAddBackupDelivery() {
    setIsWorking(true)
    const id = await generateUniqueId('stops')
    await SE_API.post(
      `/stops/${id}/create`,
      {
        id,
        type: 'delivery',
        handler_id: rescue.handler_id,
        rescue_id: rescue.id,
        organization_id: organization.id,
        location_id: location.id,
        status: STATUSES.ACTIVE,
        notes: null,
        percent_of_total_dropped: 100,
        impact_data_dairy: 0,
        impact_data_bakery: 0,
        impact_data_produce: 0,
        impact_data_meat_fish: 0,
        impact_data_non_perishable: 0,
        impact_data_prepared_frozen: 0,
        impact_data_mixed: 0,
        impact_data_other: 0,
        impact_data_total_weight: 0,
        timestamp_created: createTimestamp(),
        timestamp_updated: createTimestamp(),
        timestamp_logged_start: createTimestamp(),
        timestamp_logged_finish: null,
        timestamp_scheduled_start: rescue.timestamp_scheduled_start,
        timestamp_scheduled_finish: rescue.timestamp_scheduled_finish,
      },
      user.accessToken
    )
    await SE_API.post(
      `/rescues/${rescue.id}/update`,
      {
        stop_ids: [...rescue.stops.map(i => i.id), id],
        timestamp_updated: createTimestamp(),
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
        placeholder="Donor Organization..."
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
