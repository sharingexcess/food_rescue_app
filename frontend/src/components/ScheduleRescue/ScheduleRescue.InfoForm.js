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
      <Text
        color="element.tertiary"
        fontSize="xs"
        fontWeight="700"
        textTransform="uppercase"
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
        Handler
        <Text
          as="span"
          fontWeight="300"
          fontSize="10px"
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
