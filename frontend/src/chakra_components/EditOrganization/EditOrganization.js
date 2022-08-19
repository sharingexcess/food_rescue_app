import { Button, Flex, Heading, Input, Select, Text } from '@chakra-ui/react'
import { Page, Autocomplete } from 'chakra_components'
import {
  createTimestamp,
  DONOR_TYPES,
  generateUniqueId,
  ORG_TYPES,
  RECIPIENT_TYPES,
  setFirestoreData,
  SE_API,
} from 'helpers'
import { useApi, useAuth } from 'hooks'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

export function EditOrganization() {
  const { user } = useAuth()
  const { organization_id } = useParams()
  const { data: organization } = useApi(`/organization/${organization_id}`)
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

  useEffect(() => {
    setFormData({
      ...formData,
      name: organization?.name,
      subtype: organization?.subtype,
      type: organization?.type,
    })
    console.log('org', organization)
  }, [organization])

  async function handleSubmit() {
    const id = organization_id || (await generateUniqueId('organizations'))
    await SE_API.post(
      `/organization/${organization_id}/update`,
      {
        id: id,
        name: formData.name,
        subtype: formData.subtype,
        type: formData.type,
        timestamp_updated: createTimestamp(),
      },
      user.accessToken
    )
    navigate(`/organizations/${organization_id}`)
  }

  return (
    <Page
      title="Edit Organization"
      breadcrumbs={[
        { label: 'Organizations', link: '/organizations' },
        { label: 'Edit', link: `/organizations/${organization_id}/edit` },
      ]}
    >
      <Flex direction="column" h="100%">
        <Heading
          as="h1"
          fontWeight="700"
          size="2xl"
          mb="24px"
          textTransform="capitalize"
          color="element.primary"
        >
          Edit Organization
        </Heading>

        <Text color="element.primary" fontWeight="400">
          Organization Name
        </Text>
        <Input
          value={formData.name}
          variant="flushed"
          mb="6"
          id="name"
          placeholder="Name..."
          onChange={e => handleChange(e)}
        />
        <Text color="element.primary" fontWeight="400">
          Organization Type
        </Text>
        <Select
          variant="flushed"
          id="type"
          onChange={e => handleChange(e)}
          value={formData.type}
          flexGrow="0.5"
        >
          <option value="">None</option>
          <option value="recipient">Recipient</option>
          <option value="donor">Donor</option>
        </Select>

        <Text color="element.primary" fontWeight="400">
          {formData.type === 'donor' ? 'Donor Type' : 'Recipient Type'}
        </Text>
        <Select
          variant="flushed"
          id="subtype"
          textTransform="capitalize"
          onChange={e => handleChange(e)}
          value={formData.subtype}
          flexGrow="0.5"
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
        <Flex direction="column" mt="96px">
          <Link to={`/organizations/${organization_id}/create-location`}>
            <Button variant="secondary" my={4} w="100%">
              Add Location
            </Button>
          </Link>
          <Button variant="primary" onClick={handleSubmit}>
            Edit Organiztion
          </Button>
        </Flex>
      </Flex>
    </Page>
  )
}
