import { AddIcon, SearchIcon } from '@chakra-ui/icons'
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
  Text,
} from '@chakra-ui/react'
import { PageTitle } from 'chakra_components/PageTitle/PageTitle'
import { ORG_TYPE_ICONS } from 'helpers'
import { useApi, useAuth } from 'hooks'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function Organizations() {
  const { data: organizations } = useApi('/organizations')
  const [searchValue, setSearchValue] = useState('')
  const [type, setType] = useState()
  const [subtype, setSubtype] = useState()
  const { hasAdminPermission } = useAuth()

  function handleChange(e) {
    setSearchValue(e.target.value)
  }

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
      <InputGroup mb="6">
        <InputLeftElement mr="2" color="element.secondary">
          <SearchIcon />
        </InputLeftElement>
        <Input
          placeholder="Search by name..."
          value={searchValue}
          onChange={handleChange}
        />
      </InputGroup>
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
          <option value="recipient_donor">All types</option>
          <option value="recipient">Recipient</option>
          <option value="donor">Donor</option>
        </Select>
        <Select
          onChange={e => setSubtype(e.target.value)}
          value={subtype}
          flexGrow="0.5"
          flexBasis={['40%', '40%', '180px', '180px', '180px']}
        >
          {type === 'donor' ? (
            <>
              <option value="recipient_donor">All subtypes</option>
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
              <option value="holding">Holding</option>
              <option value="other">Other</option>
            </>
          ) : (
            <>
              <option value="recipient_donor">All subtypes</option>
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
      </Flex>
      {organizations ? (
        organizations
          .filter(i => (type ? i.type === type : true))
          .filter(i => (subtype ? i.subtype === subtype : true))
          .filter(i => i.name.toLowerCase().includes(searchValue.toLowerCase()))
          .map((org, i) => (
            <Box key={i}>
              <OrganizationCard organization={org} />
              {i !== organizations.length - 1 && <Divider />}
            </Box>
          ))
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
        </Flex>
      </Flex>
    </Link>
  )
}
