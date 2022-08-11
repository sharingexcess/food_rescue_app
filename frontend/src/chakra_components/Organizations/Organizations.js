import { Button, Flex, Heading, Input, Select, Text } from '@chakra-ui/react'
import { Page } from 'chakra_components'
import { DONOR_TYPES, ORG_SUBTYPES, RECIPIENT_TYPES } from 'helpers'
import { useApi } from 'hooks'
import { useState } from 'react'

export function Organizations() {
  const { data: organizations } = useApi('/organizations')
  const [searchValue, setSearchValue] = useState('')
  const [orgType, setOrgType] = useState('')
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
      <Text fontWeight={400}>Search</Text>
      <Input
        placeholder="Search by name..."
        value={searchValue}
        onChange={handleChange}
      />
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
              <option value="">All subtypes</option>
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
              <option value="holding">Holding</option>
              <option value="other">Other</option>
            </>
          ) : (
            <>
              <option value="">All subtypes</option>
              <option value="food_bank">Food Bank</option>
              <option value="agency">Agency</option>
              <option value="home_delivery">Home Delivery</option>
              <option value="community_fridge">Community Fridge</option>
              <option value="popup">Popup</option>
              <option value="holding">Holding</option>
              <option value="other">Other</option>
            </>
            // Object.keys(RECIPIENT_TYPES).forEach((sub, i) => (
            //   <option key={i} value={sub}>
            //     {sub}
            //   </option>
            // ))
          )}
        </Select>
      </Flex>
      <Button variant="secondary" w="100%" mt={4}>
        New
      </Button>
      {organizations &&
        organizations
          // .filter(i => i.name.includes(searchValue))
          .map((org, i) => (
            <>
              <OrganizationCard org={org} key={org.id} />
              {i !== organizations.length - 1 && <Divider />}
            </>
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
          {organization?.name || 'User'}
        </Heading>
        <Text color="element.secondary" fontSize="xs">
          {organization?.email || 'Email'}
        </Text>
      </Flex>
      <Text ml="auto">{permissionIcon(organization?.permission)}</Text>
    </Flex>
  )
}
