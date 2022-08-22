import { CheckCircleIcon, CloseIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  IconButton,
  Input,
  Select,
  useToast,
} from '@chakra-ui/react'
import { DONOR_TYPES, RECIPIENT_TYPES, SE_API } from 'helpers'
import { useAuth } from 'hooks'
import { useState } from 'react'

export function EditOrganization({ formData, setFormData, setEdit, refresh }) {
  const [isWorking, setIsWorking] = useState(false)
  const { user } = useAuth()
  const toast = useToast()

  async function handleUpdateOrganization() {
    setIsWorking(true)
    const payload = { ...formData }
    delete payload.locations
    await SE_API.post(
      `/organization/${formData.id}/update`,
      formData,
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
    </>
  )
}
