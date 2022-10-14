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
      <Text color="element.secondary" size="sm" fontWeight="500">
        Start Time
      </Text>
      <Input
        value={formData.timestamp_scheduled_start}
        type="datetime-local"
        textAlign="left"
        mb="6"
        onChange={e =>
          setFormData({
            ...formData,
            timestamp_scheduled_start: e.target.value,
          })
        }
      />

      <Text color="element.secondary" size="sm" fontWeight="500">
        End Time
      </Text>
      <Input
        value={formData.timestamp_scheduled_finish}
        type="datetime-local"
        textAlign="left"
        mb="6"
        onChange={e =>
          setFormData({
            ...formData,
            timestamp_scheduled_finish: e.target.value,
          })
        }
      />

      <Text color="element.secondary" size="sm" fontWeight="500">
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

      <Text color="element.secondary" size="sm" fontWeight="500" mt="6">
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
    </Flex>
  )
}
