import { Button, Flex, Heading, Input, Select, Text } from '@chakra-ui/react'
import { createTimestamp, generateUniqueId, SE_API } from 'helpers'
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

        <Text color="element.primary" fontWeight="400">
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
        <Text color="element.primary" fontWeight="400">
          Organization Type
        </Text>
        <Select
          id="type"
          onChange={e => handleChange(e)}
          value={formData.type}
          flexGrow="0.5"
        >
          <option value="recipient_donor">None</option>
          <option value="recipient">Recipient</option>
          <option value="donor">Donor</option>
        </Select>

        <Text color="element.primary" fontWeight="400">
          {formData.type === 'donor' ? 'Donor Type' : 'Recipient Type'}
        </Text>
        <Select
          id="subtype"
          onChange={e => handleChange(e)}
          value={formData.subtype}
          flexGrow="0.5"
        >
          {formData.type === 'donor' ? (
            <>
              <option value="recipient_donor">None</option>
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
              <option value="holding">Holding</option>
              <option value="other">Other</option>
            </>
          ) : (
            <>
              <option value="recipient_donor">None</option>
              <option value="food_bank">Food Bank</option>
              <option value="agency">Agency</option>
              <option value="home_delivery">Home Delivery</option>
              <option value="community_fridge">Community Fridge</option>
              <option value="popup">Popup</option>
              <option value="holding">Holding</option>
              <option value="other">Other</option>
            </>
          )}
        </Select>
        <Flex direction="column" mt="96px">
          <Button variant="secondary" my={4}>
            Add Location
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Create Organiztion
          </Button>
        </Flex>
      </Flex>
    </>
  )
}
