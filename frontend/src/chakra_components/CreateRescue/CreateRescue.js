import { Button, Heading, Input, Text } from '@chakra-ui/react'
import { Page, Autocomplete } from 'chakra_components'
import { useApi } from 'hooks'
import { useState } from 'react'
import { getDefaultEndTime, getDefaultStartTime } from './CreateRescue.utils'

export function CreateRescue() {
  const { data: handlers } = useApi('/users')
  const [formData, setFormData] = useState({
    timestamp_scheduled_start: getDefaultStartTime(),
    timestamp_scheduled_finish: getDefaultEndTime(),
    handler: null,
  })

  function searchForHandler(value) {
    return handlers.filter(i =>
      i.name.toLowerCase().includes(value.toLowerCase())
    )
  }

  return (
    <Page
      title="Create Rescue"
      breadcrumbs={[
        { label: 'Rescues', link: '/chakra/rescues' },
        { label: 'Create', link: '/chakra/create-rescue' },
      ]}
    >
      <Heading
        as="h1"
        fontWeight="700"
        size="2xl"
        mb="24px"
        textTransform="capitalize"
        color="element.primary"
      >
        Create Rescue
      </Heading>

      <Text color="element.primary" fontWeight="600">
        Start Time
      </Text>
      <Input
        value={formData.timestamp_scheduled_start}
        variant="flushed"
        type="datetime-local"
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
        variant="flushed"
        type="datetime-local"
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
      </Text>
      <Autocomplete
        placeholder="Search by name..."
        value={formData.handler}
        setValue={handler => setFormData({ ...formData, handler })}
        handleChange={name => searchForHandler(name)}
        optionLabel={option => `${option.name} (${option.email})`}
        mb="16"
      />
      <Button w="100%" variant="primary" mt="auto">
        Add Stops
      </Button>
    </Page>
  )
}
