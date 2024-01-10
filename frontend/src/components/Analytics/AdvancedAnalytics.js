import {
  Box,
  Flex,
  VStack,
  Image,
  Text,
  Badge,
  Heading,
  Divider,
  Input,
} from '@chakra-ui/react'
import { useState, useEffect, useMemo } from 'react'
import { useApi } from 'hooks'

import {
  aggregateWeightsByOrganization,
  sortedOrganizationsByWeight,
  getOrganizationsBySortedWeights,
  startOfDay,
  endOfDay,
} from './helper'

export function AdvancedAnalytics({ startDate, endDate }) {
  const search = new URLSearchParams(window.location.search)

  const [collectionTransfers, setcollectionTransfers] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [distributionTransfers, setdistributionTransfers] = useState([])

  const [breakdown] = useState(
    search.get('breakdown')
      ? decodeURIComponent(search.get('breakdown'))
      : 'Food Category'
  )

  const [
    collectionOrganizationsBySortedWeights,
    setCollectionOrganizationsBySortedWeights,
  ] = useState([])
  const [
    distributionOrganizationsBySortedWeights,
    setDistributionOrganizationsBySortedWeights,
  ] = useState([])

  const [apiData, setApiData] = useState(null)

  const params = useMemo(
    () => ({
      date_range_start: startOfDay(startDate),
      date_range_end: endOfDay(endDate),
      breakdown,
      analyticsType: 'advanced',
    }),
    [startDate, endDate, breakdown]
  )

  const { data: advanedApiData, loading } = useApi('/analytics', params)

  useEffect(() => {
    if (advanedApiData) {
      setApiData(advanedApiData)
    }
  }, [advanedApiData])

  useEffect(() => {
    if (apiData) {
      setcollectionTransfers(apiData.collections)
      setdistributionTransfers(apiData.distributions)
      setOrganizations(apiData.organizations)
    }
  }, [apiData])

  useEffect(() => {
    const aggregateCollectionWeights =
      aggregateWeightsByOrganization(collectionTransfers)

    const aggregateDistributionWeights = aggregateWeightsByOrganization(
      distributionTransfers
    )
    const sortedCollectionOrgsByWeight = sortedOrganizationsByWeight(
      aggregateCollectionWeights
    )
    const sortedDistributionOrgsByWeight = sortedOrganizationsByWeight(
      aggregateDistributionWeights
    )

    const getCollectionOrgsBySortedWeights = getOrganizationsBySortedWeights(
      sortedCollectionOrgsByWeight,
      organizations
    )
    setCollectionOrganizationsBySortedWeights(getCollectionOrgsBySortedWeights)

    const getDistributionOriganizationsBySortedWeights =
      getOrganizationsBySortedWeights(
        sortedDistributionOrgsByWeight,
        organizations
      )
    setDistributionOrganizationsBySortedWeights(
      getDistributionOriganizationsBySortedWeights
    )
  }, [collectionTransfers, distributionTransfers])

  const [donorSearchQuery, setDonorSearchQuery] = useState('')
  const [recipientSearchQuery, setRecipientSearchQuery] = useState('')

  // Filter donors based on the search query
  const filteredDonors = collectionOrganizationsBySortedWeights.filter(donor =>
    donor.name.toLowerCase().includes(donorSearchQuery.toLowerCase())
  )

  // Filter recipients based on the search query
  const filteredRecipients = distributionOrganizationsBySortedWeights.filter(
    recipient =>
      recipient.name.toLowerCase().includes(recipientSearchQuery.toLowerCase())
  )

  const donorsToDisplay = donorSearchQuery
    ? filteredDonors
    : collectionOrganizationsBySortedWeights.slice(0, 4)

  const recipientsToDisplay = recipientSearchQuery
    ? filteredRecipients
    : distributionOrganizationsBySortedWeights.slice(0, 4)

  return (
    <Box>
      <Flex
        gap="4"
        justify="space-between"
        mb="4"
        flexDirection={'column'}
      ></Flex>

      <Flex
        gap="4"
        justify="space-between"
        mb="4"
        flexDirection={'column'}
        mt={8}
      >
        <Heading>Top Donors</Heading>
        <div style={{ width: '100%', height: '300px' }}>
          <VStack align="start" spacing={5} mt={2}>
            {apiData && !loading ? (
              <>
                <Input
                  placeholder="Search donors..."
                  value={donorSearchQuery}
                  onChange={e => setDonorSearchQuery(e.target.value)}
                />
                {donorsToDisplay.map(donor => (
                  <Box
                    key={donor.id}
                    borderWidth="1px"
                    borderRadius="lg"
                    padding={5}
                    width="100%"
                    boxShadow="lg"
                    cursor={'pointer'}
                    onClick={() =>
                      (window.location.href = `/dashboards/${donor.id}`)
                    }
                  >
                    <Box display="flex" alignItems="center">
                      <Image
                        width="64px"
                        borderRadius="12"
                        src={
                          donor.dashboard_logo ||
                          'https://uploads-ssl.webflow.com/64515383645eb646d576e1fd/64515383645eb6607b76e285_logo.png'
                        }
                        alt={donor.name}
                        marginRight={3}
                      />
                      <Box>
                        <Text fontSize="xl" fontWeight="bold">
                          {donor.name}
                        </Text>
                        <Text color="gray.500">{donor.subtype}</Text>
                      </Box>
                    </Box>

                    <Box mt={3}>
                      <Text>
                        Donated:{' '}
                        {donor.total_weight_donated
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
                        <b>lbs.</b>
                      </Text>
                      {donor.tags && donor.tags.length > 0 && (
                        <Box mt={2}>
                          {donor.tags.map(tag => (
                            <Badge key={tag} marginRight={2} height={5}>
                              {tag}
                            </Badge>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}{' '}
              </>
            ) : (
              <Text> Loading... </Text>
            )}
          </VStack>

          <Flex
            gap="4"
            justify="space-between"
            mb="4"
            flexDirection={'column'}
            mt={8}
          >
            <Divider />

            <Heading>Top Recipients</Heading>
            <VStack align="start" spacing={5} mt={2}>
              {apiData && !loading ? (
                <>
                  <Input
                    placeholder="Search recipients..."
                    value={recipientSearchQuery}
                    onChange={e => setRecipientSearchQuery(e.target.value)}
                  />
                  {recipientsToDisplay.map(donor => (
                    <Box
                      key={donor.id}
                      borderWidth="1px"
                      borderRadius="lg"
                      padding={5}
                      width="100%"
                      boxShadow="lg"
                      cursor={'pointer'}
                      onClick={() =>
                        (window.location.href = `/dashboards/${donor.id}`)
                      }
                    >
                      <Box display="flex" alignItems="center">
                        <Image
                          width="64px"
                          borderRadius="12"
                          src={
                            donor.dashboard_logo ||
                            'https://uploads-ssl.webflow.com/64515383645eb646d576e1fd/64515383645eb6607b76e285_logo.png'
                          }
                          alt={donor.name}
                          marginRight={3}
                        />
                        <Box>
                          <Text fontSize="xl" fontWeight="bold">
                            {donor.name}
                          </Text>
                          <Text color="gray.500">{donor.subtype}</Text>
                        </Box>
                      </Box>

                      <Box mt={3}>
                        <Text>
                          Received:{' '}
                          {donor.total_weight_donated
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
                          <b>lbs.</b>
                        </Text>
                        {donor.tags && donor.tags.length > 0 && (
                          <Box mt={2}>
                            {donor.tags.map(tag => (
                              <Badge key={tag} marginRight={2}>
                                {tag}
                              </Badge>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))}{' '}
                </>
              ) : (
                <Text> Loading... </Text>
              )}
            </VStack>
          </Flex>
        </div>
      </Flex>
    </Box>
  )
}
