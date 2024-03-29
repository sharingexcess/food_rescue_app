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

export function DonorRecipients({ startDate, endDate }) {
  const [collectionTransfers, setcollectionTransfers] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [distributionTransfers, setdistributionTransfers] = useState([])

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
      breakdown: 'Food Category',
      analyticsType: 'advancedAnalytics',
      transferType: 'all',
      fetchRescues: 'false',
      fetchOrganizations: 'true',
    }),
    [startDate, endDate]
  )

  const { data: advanedApiData, loading } = useApi('/analytics', params)

  useEffect(() => {
    if (advanedApiData) {
      setApiData(advanedApiData)
    }
  }, [advanedApiData])

  useEffect(() => {
    if (apiData) {
      setcollectionTransfers(
        apiData.total_transfers.filter(
          transfer => transfer.type === 'collection'
        )
      )
      setdistributionTransfers(
        apiData.total_transfers.filter(
          transfer => transfer.type === 'distribution'
        )
      )
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
  const filteredDonors = collectionOrganizationsBySortedWeights.filter(
    donor =>
      donor.name.toLowerCase().includes(donorSearchQuery.toLowerCase()) ||
      donor.subtype.toLowerCase().includes(donorSearchQuery.toLowerCase())
  )

  // Filter recipients based on the search query
  const filteredRecipients = distributionOrganizationsBySortedWeights.filter(
    recipient =>
      recipient.name
        .toLowerCase()
        .includes(recipientSearchQuery.toLowerCase()) ||
      recipient.subtype
        .toLowerCase()
        .includes(recipientSearchQuery.toLowerCase())
  )

  const donorsToDisplay = donorSearchQuery
    ? filteredDonors
    : collectionOrganizationsBySortedWeights

  const recipientsToDisplay = recipientSearchQuery
    ? filteredRecipients
    : distributionOrganizationsBySortedWeights

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
                  placeholder="Search by name, "
                  value={donorSearchQuery}
                  onChange={e => setDonorSearchQuery(e.target.value)}
                />
                <Box
                  display="grid"
                  gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))"
                  gap={5}
                  width="100%"
                  mt={5}
                  overflowY="auto"
                  maxHeight="80vh"
                >
                  {donorsToDisplay.map(donor => (
                    <Box
                      key={donor.id}
                      borderWidth="1px"
                      borderRadius="lg"
                      padding={5}
                      boxShadow="lg"
                      cursor="pointer"
                      onClick={() =>
                        (window.location.href = `/dashboards/${donor.id}`)
                      }
                    >
                      <Box display="flex" alignItems="center">
                        <Image
                          width="64px"
                          borderRadius="12"
                          src={donor.dashboard_logo || '/logo.png'}
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
                  ))}
                </Box>
              </>
            ) : (
              <Text>Loading...</Text>
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
                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))"
                    gap={5}
                    width="100%"
                    mt={5}
                    overflowY="auto"
                    maxHeight="80vh"
                  >
                    {recipientsToDisplay.map(recipient => (
                      <Box
                        key={recipient.id}
                        borderWidth="1px"
                        borderRadius="lg"
                        padding={5}
                        boxShadow="lg"
                        cursor="pointer"
                        onClick={() =>
                          (window.location.href = `/dashboards/${recipient.id}`)
                        }
                      >
                        <Box display="flex" alignItems="center">
                          <Image
                            width="64px"
                            borderRadius="12"
                            src={recipient.dashboard_logo || '/logo.png'}
                            alt={recipient.name}
                            marginRight={3}
                          />
                          <Box>
                            <Text fontSize="xl" fontWeight="bold">
                              {recipient.name}
                            </Text>
                            <Text color="gray.500">{recipient.subtype}</Text>
                          </Box>
                        </Box>
                        <Box mt={3}>
                          <Text>
                            Received:{' '}
                            {recipient.total_weight_donated
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
                            lbs.
                          </Text>
                          {recipient.tags && recipient.tags.length > 0 && (
                            <Box mt={2}>
                              {recipient.tags.map(tag => (
                                <Badge key={tag} marginRight={2}>
                                  {tag}
                                </Badge>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : (
                <Text>Loading...</Text>
              )}
            </VStack>
          </Flex>
        </div>
      </Flex>
    </Box>
  )
}
