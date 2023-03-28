import { Button, Flex, Input, Select, Text } from '@chakra-ui/react'
import { PageTitle } from 'components/PageTitle/PageTitle'
import { DONOR_TYPES, RECIPIENT_TYPES, SE_API } from 'helpers'
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
  const [isLoading, setIsLoading] = useState()

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  async function handleSubmit() {
    setIsLoading(true)
    const organization = await SE_API.post(
      `/organizations/create`,
      {
        name: formData.name,
        type: formData.type,
        subtype: formData.subtype,
        is_deleted: false,
      },
      user.accessToken
    )
    setIsLoading(false)
    navigate(`/organizations/${organization.id}`)
  }

  return (
    <>
      <Flex direction="column" h="100%">
        <PageTitle>Create Organization</PageTitle>

        <Text
          color="element.tertiary"
          fontSize="xs"
          fontWeight="700"
          textTransform="uppercase"
        >
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
        <Text
          color="element.tertiary"
          fontSize="xs"
          fontWeight="700"
          textTransform="uppercase"
        >
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

        <Text
          color="element.tertiary"
          fontSize="xs"
          fontWeight="700"
          textTransform="uppercase"
        >
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
            disabled={
              !formData.name || !formData.type || !formData.subtype || isLoading
            }
            isLoading={isLoading}
            loadingText="Creating organization..."
          >
            Create Organization
          </Button>
        </Flex>
      </Flex>
    </>
  )
}
