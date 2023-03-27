import { AddIcon, CheckIcon } from '@chakra-ui/icons'
import {
  Flex,
  Tag,
  TagCloseButton,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  Input,
} from '@chakra-ui/react'
import { SE_API } from 'helpers'
import { useAuth } from 'hooks'
import { useState } from 'react'

export function Tags({ formData, setFormData }) {
  const [addTag, setAddTag] = useState()
  const { user } = useAuth()

  function handleRemoveTag(tag) {
    if (window.confirm(`Are you sure you want to remove the ${tag} tag?`)) {
      const updatedTags = formData.tags.filter(i => i !== tag)
      setFormData({ ...formData, tags: updatedTags })
      const payload = { ...formData, tags: updatedTags, is_deleted: false }
      delete payload.locations
      SE_API.post(
        `/organizations/update/${formData.id}`,
        payload,
        user.accessToken
      )
    }
  }

  function handleAddTag() {
    const updatedTags = formData.tags ? [...formData.tags, addTag] : [addTag]
    setFormData({ ...formData, tags: updatedTags })
    const payload = { ...formData, tags: updatedTags, is_deleted: false }
    delete payload.locations

    SE_API.post(
      `/organizations/update/${formData.id}`,
      payload,
      user.accessToken
    )
    setAddTag()
  }

  return (
    <Flex gap="2" py="4" wrap="wrap" w="100%">
      {formData?.tags &&
        formData.tags.map(i => (
          <Tag
            key={i}
            size="md"
            py="1"
            px="3"
            borderRadius="full"
            variant="solid"
            bg="green.secondary"
            color="green.primary"
          >
            <TagLabel fontSize="sm">{i}</TagLabel>
            <TagCloseButton onClick={() => handleRemoveTag(i)} />
          </Tag>
        ))}
      <Tag
        size="md"
        py="1"
        px="3"
        borderRadius="full"
        variant="solid"
        bg="green.secondary"
        color="green.primary"
        cursor={typeof addTag === 'string' ? null : 'pointer'}
        onClick={() => (typeof addTag === 'string' ? null : setAddTag(''))}
      >
        {typeof addTag === 'string' ? (
          <>
            <TagLabel>
              <Input
                variant="flushed"
                autoFocus
                size="xs"
                value={addTag}
                w={addTag.length * 6 + 8 + 'px'}
                border="none"
                minW="4"
                ml="2"
                onChange={e => setAddTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTag()}
              />
            </TagLabel>
            <TagRightIcon
              boxSize="12px"
              as={CheckIcon}
              cursor="pointer"
              onClick={handleAddTag}
            />
          </>
        ) : (
          <>
            <TagLeftIcon boxSize="12px" as={AddIcon} />
            <TagLabel>Add a Tag</TagLabel>
          </>
        )}
      </Tag>
    </Flex>
  )
}
