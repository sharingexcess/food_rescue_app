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
      <Text color="element.primary" fontWeight="600">
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

      <Text color="element.primary" fontWeight="600">
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

      <Text color="element.primary" fontWeight="600">
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
