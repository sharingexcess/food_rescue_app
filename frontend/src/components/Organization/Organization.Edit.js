import { CheckCircleIcon, CloseIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Select,
  useToast,
} from '@chakra-ui/react'
import { DONOR_TYPES, RECIPIENT_TYPES, SE_API } from 'helpers'
import { useAuth } from 'hooks'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function EditOrganization({ formData, setFormData, setEdit, refresh }) {
  const [isWorking, setIsWorking] = useState(false)
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  async function handleUpdateOrganization() {
    setIsWorking(true)
    const payload = {
      id: formData.id,
      name: formData.name,
      type: formData.type,
      subtype: formData.subtype,
      is_deleted: false,
      dashboard_access: formData.dashboard_access || [],
      dashboard_url: formData.dashboard_url || '',
      dashboard_pass: formData.dashboard_pass || '',
    }
    await SE_API.post(
      `/organizations/update/${formData.id}`,
      payload,
      user.accessToken
    )
    refresh()
    toast({
      title: 'All set!',
      description: `Successfully updated ${formData.name}.`,
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top',
    })
    setIsWorking(false)
    setEdit(false)
  }

  async function handleDeleteOrganization() {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      if (
        window.confirm(
          'Like seriously, this is a big deal. You definitely want to delete this organization?'
        )
      ) {
        const payload = {
          id: formData.id,
          name: formData.name,
          type: formData.type,
          subtype: formData.subtype,
          is_deleted: true,
          dashboard_access: [],
        }
        await SE_API.post(
          `/organizations/update/${formData.id}`,
          payload,
          user.accessToken
        )
        navigate('/organizations')
      }
    }
  }

  return (
    <>
      <Box flexGrow="1">
        <Input
          fontWeight="700"
          fontSize="2xl"
          lineHeight="2"
          color="element.primary"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
        />
        <Flex mt="2" gap="2">
          <Select
            id="type"
            onChange={e => setFormData({ ...formData, type: e.target.value })}
            value={formData.type}
            flexGrow="0.5"
            placeholder="Select a type..."
          >
            <option value="recipient">Recipient</option>
            <option value="donor">Donor</option>
          </Select>
          <Select
            id="subtype"
            textTransform="capitalize"
            onChange={e =>
              setFormData({ ...formData, subtype: e.target.value })
            }
            value={formData.subtype}
            flexGrow="0.5"
            placeholder="Select a subtype..."
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
        </Flex>
      </Box>
      <Box>
        <Flex>
          <IconButton
            variant="ghosted"
            onClick={() => setEdit(false)}
            icon={<CloseIcon w="4" h="4" color="element.primary" />}
          />
          <IconButton
            variant="ghosted"
            onClick={handleUpdateOrganization}
            isLoading={isWorking}
            icon={<CheckCircleIcon w="6" h="6" color="se.brand.primary" />}
          />
        </Flex>
        <Button variant="tertiary" onClick={handleDeleteOrganization}>
          Delete
        </Button>
      </Box>
    </>
  )
}
