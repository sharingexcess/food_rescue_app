import { AddIcon, CopyIcon, SearchIcon } from '@chakra-ui/icons'
import {
  Box,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  Tag,
  Text,
} from '@chakra-ui/react'
import { PageTitle } from 'components/PageTitle/PageTitle'
import { DONOR_TYPES, ORG_TYPE_ICONS, RECIPIENT_TYPES } from 'helpers'
import { useApi, useAuth } from 'hooks'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export function Organizations() {
  const [searchValue, setSearchValue] = useState('')
  const [type, setType] = useState()
  const [subtype, setSubtype] = useState()
  const [tag, setTag] = useState('')
  const { hasAdminPermission } = useAuth()
  const params = useMemo(() => (tag ? { tag } : null), [tag])
  // const { data: organizations } = useApi('/organizations/list', params)
  const organizations = []
  function handleChange(e) {
    setSearchValue(e.target.value)
  }

  function handleTagChange(e) {
    setTag(e.target.value)
  }

  const filteredOrgs = organizations
    ? organizations
        .filter(i => !i.is_deleted)
        .filter(i => (type ? i.type === type : true))
        .filter(i => (subtype ? i.subtype === subtype : true))
        .filter(i => i.name.toLowerCase().includes(searchValue.toLowerCase()))
    : []

  const filteredOrgCount = filteredOrgs.length
  const filteredOrgLocationCount = filteredOrgs.reduce(
    (total, current) =>
      total + (current.locations.filter(i => !i.is_deleted).length || 0),
    0
  )
  return (
    <>
      <Flex justify="space-between">
        <PageTitle>Organizations</PageTitle>
        {hasAdminPermission && (
          <Link to="/create-organization">
            <IconButton icon={<AddIcon />} borderRadius="3xl" />
          </Link>
        )}
      </Flex>
      <Flex
        justify="space-between"
        flexWrap={['wrap', 'wrap', 'nowrap', 'nowrap', 'nowrap']}
        gap="4"
        mb="6"
      >
        <InputGroup>
          <InputLeftElement mr="2" color="element.secondary">
            <SearchIcon />
          </InputLeftElement>
          <Input
            placeholder="Search by name..."
            value={searchValue}
            onChange={handleChange}
          />
        </InputGroup>
        <InputGroup>
          <InputLeftElement mr="2" color="element.secondary">
            <CopyIcon />
          </InputLeftElement>
          <Input
            value={tag}
            onChange={handleTagChange}
            placeholder="Search by tag..."
          />
        </InputGroup>
      </Flex>
      <Flex
        justify="space-between"
        flexWrap={['wrap', 'wrap', 'nowrap', 'nowrap', 'nowrap']}
        gap="4"
        mb="8"
      >
        <Select
          onChange={e => setType(e.target.value)}
          value={type}
          flexGrow="0.5"
          flexBasis={['40%', '40%', '180px', '180px', '180px']}
        >
          <option value="">All types</option>
          <option value="recipient">Recipient</option>
          <option value="donor">Donor</option>
        </Select>
        <Select
          onChange={e => setSubtype(e.target.value)}
          value={subtype}
          flexGrow="0.5"
          flexBasis={['40%', '40%', '180px', '180px', '180px']}
          textTransform="capitalize"
        >
          <option value="">All Subtypes</option>
          {type === 'donor'
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
      {organizations ? (
        <>
          <Text mb="4" color="element.secondary">
            {filteredOrgCount} organizations, {filteredOrgLocationCount}{' '}
            locations
          </Text>
          {filteredOrgs.map((org, i) => (
            <Box key={i}>
              <OrganizationCard organization={org} />
              {i !== organizations.length - 1 && <Divider />}
            </Box>
          ))}
        </>
      ) : (
        <>
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
          <Skeleton h="16" borderRadius="md" w="100%" my="3" />
        </>
      )}
    </>
  )
}

function OrganizationCard({ organization }) {
  return (
    <Link to={`/organizations/${organization.id}`}>
      <Flex justify="start" align="center" py="4">
        <Text fontSize="2xl">{ORG_TYPE_ICONS[organization.subtype]}</Text>
        <Flex direction="column" ml="4">
          <Heading as="h2" size="md" fontWeight="600" color="element.primary">
            {organization?.name || organization?.type}
          </Heading>
          <Text
            color="element.secondary"
            fontSize="xs"
            textTransform="capitalize"
          >
            {`${organization?.type.replace(
              '_',
              ' '
            )} - ${organization?.subtype.replace('_', ' ')}`}
          </Text>
          <Flex mt="2" gap="1" wrap="wrap">
            {organization.locations
              .filter(i => !i.is_deleted)
              .map(i => (
                <Tag
                  key={i.id}
                  size="sm"
                  bg="blue.secondary"
                  color="blue.primary"
                  borderRadius="xl"
                  flexShrink={0}
                >
                  {i.nickname || i.address1}
                </Tag>
              ))}
          </Flex>
        </Flex>
      </Flex>
    </Link>
  )
}
