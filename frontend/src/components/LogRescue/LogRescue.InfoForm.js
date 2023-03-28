import { Flex, Input, Select, Text } from '@chakra-ui/react'
import { Autocomplete } from 'components'

export function InfoForm({ formData, setFormData, handlers }) {
  function searchForHandler(value) {
    return handlers.filter(i =>
      i.name.toLowerCase().includes(value.toLowerCase())
    )
  }

  return (
    <Flex direction="column" mb="8">
      <Text
        color="element.tertiary"
        fontSize="xs"
        fontWeight="700"
        textTransform="uppercase"
        mt="6"
      >
        Scheduled Time
      </Text>
      <Input
        value={formData.timestamp_scheduled}
        type="datetime-local"
        textAlign="left"
        mb="6"
        onChange={e =>
          setFormData({
            ...formData,
            timestamp_scheduled: e.target.value,
          })
        }
      />
      <Text
        color="element.tertiary"
        fontSize="xs"
        fontWeight="700"
        textTransform="uppercase"
      >
        Completed Time
      </Text>
      <Input
        value={formData.timestamp_completed}
        type="datetime-local"
        textAlign="left"
        mb="6"
        onChange={e =>
          setFormData({
            ...formData,
            timestamp_completed: e.target.value,
          })
        }
      />

      <Text
        color="element.tertiary"
        fontSize="xs"
        fontWeight="700"
        textTransform="uppercase"
      >
        Handler
      </Text>
      <Autocomplete
        placeholder="Search by name..."
        value={formData.handler}
        setValue={handler => setFormData({ ...formData, handler })}
        handleChange={name => searchForHandler(name)}
        optionLabel={option => `${option.name} (${option.email})`}
        displayField="name"
      />

      <Text
        color="element.tertiary"
        fontSize="xs"
        fontWeight="700"
        textTransform="uppercase"
        mt="6"
      >
        Rescue Type
      </Text>
      <Select
        value={formData.type}
        onChange={e => setFormData({ ...formData, type: e.target.value })}
      >
        <option value="retail">Retail</option>
        <option value="wholesale">Wholesale</option>
        <option value="direct-link">Direct Link</option>
      </Select>

      <Text
        color="element.tertiary"
        fontSize="xs"
        fontWeight="700"
        textTransform="uppercase"
        mt="6"
      >
        Notes
      </Text>
      <Input
        value={formData.notes}
        type="text"
        textAlign="left"
        mb="6"
        placeholder="Add notes to this rescue..."
        onChange={e =>
          setFormData({
            ...formData,
            notes: e.target.value,
          })
        }
      />
    </Flex>
  )
}
