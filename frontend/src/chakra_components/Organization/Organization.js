import {
  Box,
  Heading,
  Link as Clink,
  Flex,
  Skeleton,
  Text,
  Button,
  IconButton,
  Input,
  useToast,
  Select,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  TagLeftIcon,
  TagRightIcon,
} from '@chakra-ui/react'
import { useApi, useAuth, useIsMobile } from 'hooks'
import { Link, useParams } from 'react-router-dom'
import { Error } from 'components'
import {
  formatPhoneNumber,
  ORG_TYPE_ICONS,
  SE_API,
  DONOR_TYPES,
  RECIPIENT_TYPES,
} from 'helpers'
import { useEffect, useState } from 'react'
import {
  AddIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronRightIcon,
  CloseIcon,
  EditIcon,
} from '@chakra-ui/icons'

export function Organization({ setBreadcrumbs }) {
  const { organization_id } = useParams()
  const { hasAdminPermission } = useAuth()
  const {
    data: organization,
    loading,
    error,
    refresh,
  } = useApi(`/organization/${organization_id}`)
  const { user } = useAuth()
  const [edit, setEdit] = useState(false)
  const [formData, setFormData] = useState({})
  const [isWorking, setIsWorking] = useState(false)
  const [addTag, setAddTag] = useState()
  const toast = useToast()

  useEffect(() => {
    if (organization) {
      setFormData(organization)
      setBreadcrumbs([
        { label: 'Organizations', link: '/organizations' },
        { label: organization.name, link: `/organizations/${organization.id}` },
      ])
    }
  }, [organization])

  async function handleUpdateOrganization() {
    setIsWorking(true)
    const payload = { ...formData }
    delete payload.locations
    await SE_API.post(
      `/organization/${organization_id}/update`,
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

  function handleRemoveTag(tag) {
    if (window.confirm(`Are you sure you want to remove the ${tag} tag?`)) {
      const updatedTags = formData.tags.filter(i => i !== tag)
      setFormData({ ...formData, tags: updatedTags })
      const payload = { ...formData, tags: updatedTags }
      delete payload.locations
      SE_API.post(
        `/organization/${organization_id}/update`,
        payload,
        user.accessToken
      )
    }
  }

  function handleAddTag() {
    const updatedTags = formData.tags ? [...formData.tags, addTag] : [addTag]
    setFormData({ ...formData, tags: updatedTags })
    const payload = { ...formData, tags: updatedTags }
    delete payload.locations
    SE_API.post(
      `/organization/${organization_id}/update`,
      payload,
      user.accessToken
    )
    setAddTag()
  }

  if (loading && !organization) {
    return <LoadingOrganization />
  } else if (error) {
    return <OrganizationPageError message={error} />
  } else if (!organization) {
    return <OrganizationPageError message="No Organization Found" />
  } else
    return (
      <>
        <Flex w="100%" mb="4" justify="space-between" align="start" gap="2">
          {edit ? (
            <>
              <Box flexGrow="1">
                <Input
                  fontWeight="700"
                  fontSize="2xl"
                  lineHeight="2"
                  color="element.primary"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <Flex mt="2" gap="2">
                  <Select
                    id="type"
                    onChange={e =>
                      setFormData({ ...formData, type: e.target.value })
                    }
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
          ) : (
            <>
              <Box>
                <Heading
                  as="h1"
                  fontWeight="700"
                  size="2xl"
                  color="element.primary"
                >
                  {organization.name}
                </Heading>
                <Text
                  textTransform="capitalize"
                  color="element.secondary"
                  mt="1"
                >
                  <Text as="span" mr="2">
                    {ORG_TYPE_ICONS[organization.subtype]}
                  </Text>
                  {organization.subtype} {organization.type}
                </Text>
              </Box>

              {hasAdminPermission && (
                <IconButton
                  variant="ghosted"
                  onClick={() => setEdit(true)}
                  icon={<EditIcon w="6" h="6" color="element.tertiary" />}
                />
              )}
            </>
          )}
        </Flex>
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
                    // onBlur={() => setAddTag()}
                    onChange={e => setAddTag(e.target.value)}
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
        {organization.locations.map((location, i) => (
          <Link
            key={i}
            to={`/organizations/${organization_id}/locations/${location?.id}`}
          >
            <Flex
              bg="surface.card"
              boxShadow="md"
              borderRadius="md"
              p="4"
              my="4"
              w="100%"
              justify="space-between"
              align="center"
            >
              <Box>
                <Heading as="h4" size="md" mb="1">
                  {location.nickname || location.address1}
                </Heading>
                <Text fontSize="sm" color="element.secondary" fontWeight="300">
                  {location.address1}
                </Text>
                <Text fontSize="sm" color="element.secondary" fontWeight="300">
                  {location.city}, {location.state} {location.zip}
                </Text>

                {location.contact_phone && (
                  <Text
                    fontSize="sm"
                    color="element.active"
                    fontWeight="300"
                    mt="1"
                  >
                    {formatPhoneNumber(location.contact_phone)}
                  </Text>
                )}
              </Box>
              <IconButton
                variant="ghosted"
                icon={<ChevronRightIcon color="element.tertiary" h="8" w="8" />}
              />
            </Flex>
          </Link>
        ))}
        {hasAdminPermission && (
          <Flex w="100%" justify="center" mt="8">
            <Link to={`/organizations/${organization_id}/create-location`}>
              <Button>+ Add Location</Button>
            </Link>
          </Flex>
        )}
      </>
    )
}

function LoadingOrganization({}) {
  const isMobile = useIsMobile()
  return (
    <>
      <Box px="4">
        <Heading
          as="h1"
          fontWeight="700"
          size="2xl"
          mb="6"
          mt="4"
          textTransform="capitalize"
          color="element.primary"
        >
          Loading...
        </Heading>
        <Skeleton h="32" my="4" />
        <Skeleton h="32" my="4" />
        <Skeleton h="32" my="4" />
        <Skeleton h="32" my="4" />
        <Skeleton h="32" my="4" />
      </Box>
    </>
  )
}

function OrganizationPageError({ message }) {
  return <Error message={message} />
}
