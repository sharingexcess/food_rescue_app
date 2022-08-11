import { Button, Heading, Input, Select, Text } from '@chakra-ui/react'
import { Page, Autocomplete } from 'chakra_components'
import { useApi } from 'hooks'
import { useState } from 'react'

export function CreateOrganization() {
  const { data: organizations } = useApi('/organization')
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    subtype: '',
  })

  return (
    <Page
      title="Create Organization"
      breadcrumbs={[
        { label: 'Organizations', link: '/chakra/organizations' },
        { label: 'Create', link: '/chakra/create-organization' },
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
        Create Organization
      </Heading>

      <Text color="element.primary" fontWeight="600">
        Organization Name
      </Text>
      <Input
        value={formData.name}
        variant="flushed"
        mb="6"
        onChange={
          e =>
            setFormData({
              ...formData,
              name: e.target.value,
            }) // same problem for onchange as in people search box
        }
      />

      <Text color="element.primary" fontWeight="600">
        Organization Type
      </Text>
      <Select
        variant="flushed"
        onChange={e => setFormData({ ...formData, type: e.target.value })}
        value={formData.type}
        flexGrow="0.5"
        flexBasis={['40%', '40%', '180px', '180px', '180px']}
      >
        <option value="recipient_donor">All types</option>
        <option value="recipient">Recipient</option>
        <option value="donor">Donor</option>
      </Select>

      <Text color="element.primary" fontWeight="600">
        {formData.type === 'donor' ? 'Donor Type' : 'Recipient Type'}
      </Text>
      <Autocomplete
        placeholder="Search by name..."
        value={formData.handler}
        setValue={handler => setFormData({ ...formData, handler })}
        optionLabel={option => `${option.name} (${option.email})`}
        mb="16"
      />
    </Page>
  )
}
