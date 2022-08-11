import { AddIcon, SearchIcon } from '@chakra-ui/icons'
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Text,
} from '@chakra-ui/react'
import { Page } from 'chakra_components'
import { DONOR_TYPES, ORG_SUBTYPES, RECIPIENT_TYPES } from 'helpers'
import { useApi } from 'hooks'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function Organizations() {
  const { data: organizations } = useApi('/organizations')
  const [searchValue, setSearchValue] = useState('')
  const [orgType, setOrgType] = useState('recipient_donor')
  const [orgSubType, setOrgSubType] = useState('')

  function handleChange(e) {
    // setSearchValue(e.target.value)
    console.log(e.target.value)
  }

  return (
    <Page
      id="Organizations"
      title="Organizations"
      breadcrumbs={[{ label: 'Organizations', link: '/chakra/organizations' }]}
    >
      <Flex justify="space-between">
        <Heading
          as="h1"
          fontWeight="700"
          size="2xl"
          mb="24px"
          textTransform="capitalize"
          color="element.primary"
        >
          Organizations
        </Heading>
        <Link to="/chakra/create-organization">
          <IconButton icon={<AddIcon />} borderRadius="3xl" />
        </Link>
      </Flex>
      <InputGroup mb="6">
        <InputLeftElement
          children={<SearchIcon />}
          mr="2"
          color="element.secondary"
        />
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
      >
        <Select
          variant="flushed"
          onChange={e => setOrgType(e.target.value)}
          value={orgType}
          flexGrow="0.5"
          flexBasis={['40%', '40%', '180px', '180px', '180px']}
        >
          <option value="recipient_donor">All types</option>
          <option value="recipient">Recipient</option>
          <option value="donor">Donor</option>
        </Select>
        <Select
          variant="flushed"
          onChange={e => setOrgSubType(e.target.value)}
          value={orgSubType}
          flexGrow="0.5"
          flexBasis={['40%', '40%', '180px', '180px', '180px']}
        >
          {orgType === 'donor' ? (
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
      <Button variant="secondary" w="100%" my={4}>
        New
      </Button>
      {organizations &&
        organizations
          .filter(i => orgType.includes(i.type))
          .map((org, i) => (
            <Box key={i}>
              <OrganizationCard organization={org} />
              {i !== organizations.length - 1 && <Divider />}
            </Box>
          ))}
    </Page>
  )
}

function OrganizationCard({ organization }) {
  return (
    <Flex justify="start" align="center" py="4">
      <Avatar
        src={organization?.icon}
        name={organization?.name}
        bg="gray.400"
        color="white"
      />
      <Flex direction="column" ml="4">
        <Heading as="h2" size="md" fontWeight="600" color="element.primary">
          {organization?.name || organization?.type}
        </Heading>
        <Text
          color="element.secondary"
          fontSize="xs"
          textTransform="capitalize"
        >
          {organization?.subtype.replace('_', ' ')}{' '}
          {organization?.type.replace('_', ' ')}
        </Text>
      </Flex>
      {/* <Text ml="auto">{permissionIcon(organization?.permission)}</Text> */}
    </Flex>
  )
}
