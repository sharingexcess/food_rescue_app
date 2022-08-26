import { Button, Flex, Input, Select, Text } from '@chakra-ui/react'
import { PageTitle } from 'components/PageTitle/PageTitle'
import {
  createTimestamp,
  DONOR_TYPES,
  generateUniqueId,
  RECIPIENT_TYPES,
  SE_API,
} from 'helpers'
import { useAuth } from 'hooks'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function CreateOrganization() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    subtype: '',
  })

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  async function handleSubmit() {
    const organization_id = await generateUniqueId('organizations')
    await SE_API.post(
      `/organization/${organization_id}/update`,
      {
        id: organization_id,
        name: formData.name,
        subtype: formData.subtype,
        type: formData.type,
        timestamp_created: createTimestamp(),
        timestamp_updated: createTimestamp(),
      },
      user.accessToken
    )
    navigate(`/organizations/${organization_id}`)
  }

  return (
    <>
      <Flex direction="column" h="100%">
        <PageTitle>Create Organization</PageTitle>

        <Text fontSize="sm" fontWeight="500" color="element.secondary">
          Organization Name
        </Text>
        <Input
          value={formData.name}
          mb="6"
          id="name"
          placeholder="Name..."
          onChange={
            e => handleChange(e) // same problem for onchange as in people search box
          }
        />
        <Text fontSize="sm" fontWeight="500" color="element.secondary">
          Organization Type
        </Text>
        <Select
          id="type"
          onChange={e => handleChange(e)}
          value={formData.type}
          mb="8"
          placeholder="Select a type..."
        >
          <option value="recipient">Recipient</option>
          <option value="donor">Donor</option>
        </Select>

        <Text fontSize="sm" fontWeight="500" color="element.secondary">
          {formData.type === 'donor' ? 'Donor Type' : 'Recipient Type'}
        </Text>
        <Select
          id="subtype"
          onChange={e => handleChange(e)}
          value={formData.subtype}
          mb="8"
          placeholder="Select a subtype..."
          textTransform="capitalize"
        >
          {formData.type === 'donor'
            ? Object.keys(DONOR_TYPES).map((t, i) => (
                <option
                  value={DONOR_TYPES[t]}
                  key={i}
                  style={{ textTransform: 'capitalize' }}
                >
                  {DONOR_TYPES[t].replace('_', ' ')}
                </option>
              ))
            : Object.keys(RECIPIENT_TYPES).map((t, i) => (
                <option
                  value={RECIPIENT_TYPES[t]}
                  key={i}
                  style={{ textTransform: 'capitalize' }}
                >
                  {RECIPIENT_TYPES[t].replace('_', ' ')}
                </option>
              ))}
        </Select>
        <Flex direction="column">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.type || !formData.subtype}
          >
            Create Organization
          </Button>
        </Flex>
      </Flex>
    </>
  )
}
