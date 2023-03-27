import { Flex, Input, Text } from '@chakra-ui/react'
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

      <Text color="element.secondary" size="sm" fontWeight="500">
        Handler
        <Text
          as="span"
          verticalAlign="5%"
          fontWeight="300"
          fontSize="xs"
          pb="1"
          ml="2"
          color="element.secondary"
        >
          (optional)
        </Text>
      </Text>
      <Autocomplete
        placeholder="Search by name..."
        value={formData.handler}
        setValue={handler => setFormData({ ...formData, handler })}
        handleChange={name => searchForHandler(name)}
        optionLabel={option => `${option.name} (${option.email})`}
        displayField="name"
      />
    </Flex>
  )
}
