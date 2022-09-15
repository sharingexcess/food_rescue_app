import { CloseIcon } from '@chakra-ui/icons'
import { Flex, Heading, IconButton, Select } from '@chakra-ui/react'
import { Autocomplete } from 'components/Autocomplete/Autocomplete'
import { useEffect, useState } from 'react'

export function AddStop({ type, handleAddStop, handleCancel, organizations }) {
  const [organization, setOrganization] = useState()
  const [location, setLocation] = useState()

  useEffect(() => {
    if (organization && organization.locations.length === 1) {
      setLocation(organization.locations[0])
    }
  }, [organization])

  useEffect(() => {
    if (organization && location) {
      handleAddStop({ type, organization, location })
    }
  }, [organization, location])

  function handleSearchForOrganization(value) {
    return organizations
      .filter(i => !i?.is_deleted)
      .filter(i => i.locations?.length)
      .filter(i => (i.type === 'pickup' ? 'donor' : 'recipient'))
      .filter(i => i.name.toLowerCase().includes(value.toLowerCase()))
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
      <Flex justify={'space-between'} align="center" mb="2">
        <Heading
          as="h6"
          fontWeight="600"
          letterSpacing={1}
          fontSize="sm"
          color={type === 'pickup' ? 'blue.primary' : 'green.primary'}
          textTransform="uppercase"
        >
          New {type}
        </Heading>
        <IconButton
          variant="ghosted"
          icon={<CloseIcon w="3" color="element.tertiary" />}
          onClick={handleCancel}
        />
      </Flex>
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
          {organization.locations.map(i => (
            <option value={i.id} key={i.id}>
              {i.nickname ? `${i.nickname} (${i.address1})` : i.address1}
            </option>
          ))}
        </Select>
      )}
    </Flex>
  )
}
